import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import socket, { connectSocket } from "../../app/socket";

export default function DriverNotificationListener() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const swRegistrationRef = useRef(null);
  const lastRequestIdRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const isDriver = user.role === "ambulance" || user.role === "ambulance_driver";
    if (!isDriver) return;

    const dashboardPath = "/dashboard";

    // Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => (swRegistrationRef.current = reg))
        .catch((err) => console.log("SW error:", err));
    }

    // Notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Use global socket
    connectSocket();
    socket.emit("join_driver", { driverId: user._id, role: user.role });

    const handleNewEmergency = (data) => {
      const requestId =
        data?.requestId ||
        data?._id ||
        data?.emergencyId ||
        data?.id ||
        data?.request?._id;

      if (!requestId) return;
      if (lastRequestIdRef.current === requestId) return;
      lastRequestIdRef.current = requestId;

      const patient = data?.user?.name || data?.request?.user?.name || "Emergency Patient";
      const address =
        data?.location?.address ||
        data?.user?.address ||
        data?.request?.location?.address ||
        "Unknown Location";

      const payload = { patient, address, requestId };

      if (window.location.pathname === dashboardPath) {
        toast.success("🚨 New emergency request received");
        return;
      }

      toast(
        (t) => (
          <div
            onClick={() => { toast.dismiss(t.id); navigate(dashboardPath); }}
            className="cursor-pointer"
          >
            <div className="font-bold text-red-600">🚨 Emergency Request</div>
            <div className="text-sm mt-2">
              <p><b>Patient:</b> {payload.patient}</p>
              <p className="truncate"><b>Location:</b> {payload.address}</p>
              <p className="text-red-500 mt-2 font-semibold">Tap to accept request</p>
            </div>
          </div>
        ),
        {
          duration: 15000,
          position: "top-center",
          style: { border: "1px solid #ef4444", borderRadius: "12px", padding: "14px" },
        }
      );

      if (document.visibilityState === "visible") return;
      if (Notification.permission === "granted") {
        const options = {
          body: `${payload.patient} needs help now.`,
          icon: "/logo.png",
          tag: "emergency-alert",
          requireInteraction: true,
          data: { url: dashboardPath },
        };
        if (swRegistrationRef.current) {
          swRegistrationRef.current.showNotification("🚨 Emergency Alert", options);
        } else {
          const n = new Notification("🚨 Emergency Alert", options);
          n.onclick = () => { window.focus(); navigate(dashboardPath); };
        }
      }
    };

    socket.on("new_emergency_request", handleNewEmergency);

    return () => {
      socket.off("new_emergency_request", handleNewEmergency);
    };
  }, [user?._id, user?.role, navigate]);

  return null;
}