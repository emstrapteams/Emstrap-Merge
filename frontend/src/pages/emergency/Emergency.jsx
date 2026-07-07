import { useState, useRef, useEffect, useCallback } from "react";
import API, { API_URL, cancelEmergency } from "../../services/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import CameraCapture from "../../components/emergency/CameraCapture";
import EmergencyProgress from "../../components/emergency/EmergencyProgress";
import AmbulanceFound from "../../components/emergency/AmbulanceFound";
import { useEmergency } from "../../context/EmergencyContext";

export default function Emergency() {
  const [step, setStepState] = useState(
    () => sessionStorage.getItem("emergency_step") || "start"
  );

  const [driverInfo, setDriverInfo] = useState(null);
  const { location, setLocation, photo, setPhoto } = useEmergency();

  const cameraRef = useRef(null);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const timeoutRef = useRef(null);

  const [socketReady, setSocketReady] = useState(false);

  const setStep = useCallback((s) => {
    setStepState(s);
    sessionStorage.setItem("emergency_step", s);
  }, []);

  /* ---------------- CLEANUP ---------------- */
  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, []);

  const cleanupAll = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setSocketReady(false);
  }, []);

  /* ---------------- SOCKET INIT ---------------- */
  const initSocket = useCallback(
    (requestId) => {
      if (!requestId) return;

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const socket = io(API_URL, {
        withCredentials: true,
        transports: ["websocket"],
      });

      socketRef.current = socket;
      setSocketReady(true);

      socket.emit("track_request", { requestId });

      /* TIMEOUT SAFETY */
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        toast.error("No ambulance found. Try again.");
        setStep("timeout");
        cleanupAll();
        sessionStorage.removeItem("emergency_requestId");
      }, 60000);

      /* EVENTS */
      socket.on("ambulance_assigned", (data) => {
        clearTimeout(timeoutRef.current);
        setDriverInfo(data);
        setStep("accepted");
      });

      socket.on("ambulance_location", (data) => {
        setDriverInfo((prev) =>
          prev
            ? {
                ...prev,
                location: {
                  lat: data.lat || data.latitude,
                  lng: data.lng || data.longitude,
                },
              }
            : prev
        );
      });

      socket.on("trip_completed", () => {
        toast.success("Trip completed 🚑");
        resetAll();
      });

      socket.on("emergency_cancelled", () => {
        toast.error("Emergency cancelled");
        resetAll();
      });
    },
    [cleanupAll, setStep]
  );

  /* ---------------- SESSION RESTORE ---------------- */
  useEffect(() => {
    const requestId = sessionStorage.getItem("emergency_requestId");
    if (!requestId) return;

    if (step === "searching" || step === "accepted") {
      initSocket(requestId);
    }
  }, [step, initSocket]);

  /* ---------------- START EMERGENCY ---------------- */
  const startEmergency = () => {
    const fallback = () => {
      fetch("https://ipapi.co/json/")
        .then((r) => r.json())
        .then((d) => setLocation({ lat: d.latitude, lng: d.longitude }))
        .catch(() => {});
    };

    if (!navigator.geolocation) return fallback();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      fallback,
      { enableHighAccuracy: true, timeout: 5000 }
    );

    setStep("capture");
  };

  /* ---------------- SEND EMERGENCY ---------------- */
  const handleSendEmergency = async (photoData) => {
    cameraRef.current?.stopCamera();
    setStep("searching");

    try {
      if (!location) {
        toast.error("Location not found. Enable GPS.");
        setStep("start");
        return;
      }

      const res = await API.post("/api/emergency", {
        latitude: location.lat,
        longitude: location.lng,
        imageUrl: photoData || photo || "",
      });

      const requestId = res.data?.data?._id;
      sessionStorage.setItem("emergency_requestId", requestId);

      initSocket(requestId);
    } catch (err) {
      toast.error("Emergency request failed");
      setStep("start");
    }
  };

  /* ---------------- RESET ---------------- */
  const resetAll = () => {
    setStep("start");
    setDriverInfo(null);
    setLocation(null);
    setPhoto(null);

    sessionStorage.removeItem("emergency_requestId");

    cleanupAll();
  };

  /* ---------------- CANCEL ---------------- */
  const handleCancel = async () => {
    const requestId = sessionStorage.getItem("emergency_requestId");

    try {
      if (requestId) {
        await cancelEmergency(requestId);
      }
      toast.success("Cancelled successfully");
      resetAll();
    } catch {
      toast.error("Cancel failed");
    }
  };

  /* ---------------- LIVE LOCATION UPDATE ---------------- */
  useEffect(() => {
    if (step !== "accepted" || !socketReady || !socketRef.current) return;

    const requestId = sessionStorage.getItem("emergency_requestId");
    if (!requestId) return;

    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        socketRef.current?.emit("update_user_location", {
          requestId,
          ...loc,
        });

        setLocation({ lat: loc.latitude, lng: loc.longitude });
      },
      () => toast.error("Waiting for GPS signal..."),
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [step, socketReady, setLocation]);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-10">

          {step === "start" && (
            <div className="text-center space-y-8">
              <h1 className="text-4xl font-extrabold">Emergency Ambulance</h1>
              <button
                onClick={startEmergency}
                className="bg-red-600 text-white px-14 py-6 rounded-2xl text-xl font-bold"
              >
                Emergency
              </button>
            </div>
          )}

          {step === "capture" && (
            <CameraCapture
              ref={cameraRef}
              onSend={handleSendEmergency}
              onCancel={resetAll}
            />
          )}

          {step === "searching" && <EmergencyProgress />}

          {step === "timeout" && (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">No Response Found</h2>
              <button
                onClick={resetAll}
                className="bg-black text-white px-6 py-3 rounded-xl"
              >
                Retry
              </button>
            </div>
          )}

          {step === "accepted" && (
            <AmbulanceFound
              driverInfo={driverInfo}
              onCancel={handleCancel}
            />
          )}

        </div>
      </Container>
    </div>
  );
}