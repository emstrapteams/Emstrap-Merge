import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getEmergencyDetailsAPI } from "../../services/api";
import socket, { connectSocket } from "../../app/socket";

import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import TrackingMap from "../../components/map/TrackingMap";

export default function Tracking() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const watchIdRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driver, setDriver] = useState(null);
  const [eta, setEta] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [distance, setDistance] = useState(null);
  const [speed, setSpeed] = useState(0);

  /* ---------------- LOAD INITIAL DATA ---------------- */
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEmergencyDetailsAPI(requestId);
      if (res?.success && res?.data) {
        const amb = res.data.ambulance;
        setDriver({
          name: amb?.name || "Not Assigned",
          mobile: amb?.mobile || "",
          vehicle: amb?.vehicleNumber || "",
        });
        if (res.data?.liveTracking?.currentLocation?.lat) {
          setDriverLocation(res.data.liveTracking.currentLocation);
        }
        setEta(res.data?.eta || null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load tracking data.");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  /* ---------------- SOCKET + GEOLOCATION ---------------- */
  useEffect(() => {
    if (!requestId) return;

    loadInitialData();

    connectSocket();

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    setSocketConnected(socket.connected);

    // Join the request tracking room
    socket.emit("join_request", { requestId });

    /* ---- DRIVER ASSIGNED ---- */
    socket.on("ambulance_assigned", (data) => {
      setDriver((prev) => ({ ...prev, ...data }));
      toast.success("🚑 Ambulance assigned!");
    });

    /* ---- LIVE LOCATION from ambulance (via request room) ---- */
    socket.on("ambulance_location", (data) => {
      setDriverLocation({
        lat: data?.location?.latitude ?? data?.latitude,
        lng: data?.location?.longitude ?? data?.longitude,
      });
      setSpeed(data?.speed || 0);
    });

    socket.on("live_tracking", (data) => {
      setDriverLocation({
        lat: data?.latitude,
        lng: data?.longitude,
      });
    });

    /* ---- ETA update ---- */
    socket.on("eta_update", (data) => setEta(data?.eta ?? null));

    /* ---- CANCELLED ---- */
    socket.on("emergency_cancelled", () => {
      toast.error("Emergency cancelled");
      navigate("/dashboard");
    });

    /* ---- COMPLETED ---- */
    socket.on("emergency_completed", () => {
      toast.success("Trip completed! Thank you.");
      navigate("/dashboard");
    });

    socket.on("booking_completed", () => {
      toast.success("Booking completed!");
      navigate("/dashboard");
    });

    /* ---- USER GEOLOCATION ---- */
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          socket.emit("update_user_location", { requestId, latitude: loc.lat, longitude: loc.lng });
        },
        (err) => console.error("Geo error:", err),
        { enableHighAccuracy: true, maximumAge: 2000 }
      );
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("ambulance_assigned");
      socket.off("ambulance_location");
      socket.off("live_tracking");
      socket.off("eta_update");
      socket.off("emergency_cancelled");
      socket.off("emergency_completed");
      socket.off("booking_completed");
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [requestId, navigate, loadInitialData]);

  /* ---- Open Google Maps with dynamic live coords ---- */
  const openGoogleMaps = () => {
    if (!driverLocation?.lat || !userLocation?.lat) {
      toast.error("Live location not available yet");
      return;
    }
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${driverLocation.lat},${driverLocation.lng}&destination=${userLocation.lat},${userLocation.lng}`,
      "_blank"
    );
  };

  if (loading) return <div className="p-6 text-gray-500">Loading tracking...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <>
      <Navbar />
      <Container>
        <div className="space-y-5 py-6">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <button onClick={() => navigate("/dashboard")} className="text-blue-500 text-sm">&larr; Back</button>
              <h1 className="text-xl font-bold mt-1">Live Tracking</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${socketConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-gray-500">{socketConnected ? "LIVE" : "Reconnecting..."}</span>
            </div>
          </div>

          {/* ETA / SPEED BANNER */}
          {(eta || speed > 0) && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-6">
              {eta && <div><div className="text-xs text-gray-500">ETA</div><div className="font-bold text-blue-600 text-lg">{eta} min</div></div>}
              {speed > 0 && <div><div className="text-xs text-gray-500">Speed</div><div className="font-bold text-green-600 text-lg">{Math.round(speed * 3.6)} km/h</div></div>}
            </div>
          )}

          {/* MAP */}
          <div className="h-[500px] rounded-3xl overflow-hidden shadow-lg">
            <TrackingMap
              userLocation={userLocation}
              driverLocation={driverLocation}
            />
          </div>

          {/* GOOGLE MAPS BUTTON */}
          <button
            onClick={openGoogleMaps}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 px-6 rounded-2xl shadow-lg text-lg flex items-center justify-center gap-3 transition-all"
          >
            🗺️ Navigate in Google Maps
          </button>

          {/* DRIVER INFO */}
          {driver && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 space-y-2">
              <h2 className="font-bold text-lg">Driver Details</h2>
              <p className="text-sm">👤 {driver.name}</p>
              {driver.vehicle && <p className="text-sm">🚑 {driver.vehicle}</p>}
              {driver.mobile && (
                <a href={`tel:${driver.mobile}`} className="text-sm text-blue-600 block">
                  📞 {driver.mobile}
                </a>
              )}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}