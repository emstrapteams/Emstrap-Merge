import { useEffect, useRef, useState, useCallback } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import socket, { connectSocket, disconnectSocket } from "../../app/socket";

import DashboardHeader from "./DashboardHeader";
import StatCard from "./StatCard";
import TrackingMap from "../../components/map/TrackingMap";

export default function AmbulanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const watchIdRef = useRef(null);

  /* ---------------- FETCH DASHBOARD ---------------- */
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/ambulance/dashboard");

      setBookings(res.data?.bookings || []);
      setActiveTrip(res.data?.activeTrip || null);
      setAlerts(res.data?.alerts || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- GPS TRACKING ---------------- */
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setAmbulanceLocation(loc);

        // EMIT TO GLOBAL SOCKET
        if (socket.connected) {
           socket.emit("driver_location_update", {
             driverId: JSON.parse(localStorage.getItem("user") || "{}").id || "UNKNOWN",
             requestId: activeTrip?._id || activeTrip?.requestId || null,
             latitude: pos.coords.latitude,
             longitude: pos.coords.longitude,
             speed: pos.coords.speed || 0,
             heading: pos.coords.heading || 0
           });
        }
      },
      (err) => {
        console.error("GPS error:", err);
        toast.error("Location permission denied or unavailable");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );
  }, [activeTrip]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  }, []);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    loadDashboard();
    startTracking();
    
    connectSocket();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
       socket.emit("join_driver", { driverId: user.id });
    }

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    setSocketConnected(socket.connected);

    return () => {
       stopTracking();
       socket.off("connect", handleConnect);
       socket.off("disconnect", handleDisconnect);
    };
  }, [loadDashboard, startTracking, stopTracking]);

  /* ---------------- STATS ---------------- */
  const stats = {
    active: activeTrip ? 1 : 0,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    alerts: alerts.length,
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading ambulance dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* HEADER */}
      <DashboardHeader
        hospitalName="Ambulance Control Center"
        totalAlerts={stats.alerts}
        socketConnected={socketConnected}
        systemTime={new Date().toLocaleTimeString()}
        onRefresh={loadDashboard}
      />

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Trips" value={stats.active} color="red" />
        <StatCard title="Completed" value={stats.completed} color="green" />
        <StatCard title="Pending" value={stats.pending} color="yellow" />
        <StatCard title="Alerts" value={stats.alerts} color="purple" />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MAP SECTION */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow">
          <h2 className="font-bold mb-3">Live Ambulance Tracking</h2>

          <div className="h-[520px] rounded-xl overflow-hidden">
            <TrackingMap
              ambulanceLocation={ambulanceLocation}
              activeTrip={activeTrip}
            />
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="space-y-4">

          {/* ACTIVE TRIP */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow">
            <h3 className="font-bold mb-3">Active Trip</h3>

            {activeTrip ? (
              <div className="space-y-2 text-sm">
                <p>🚑 {activeTrip.patientName}</p>
                <p>📍 {activeTrip.pickup}</p>
                <p>🏥 {activeTrip.hospital}</p>
                <p className="text-green-600 font-bold">
                  ETA: {activeTrip.eta || "--"} mins
                </p>
              </div>
            ) : (
              <p className="text-gray-400">No active trip</p>
            )}
          </div>

          {/* ALERTS */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow">
            <h3 className="font-bold mb-3">Alerts</h3>

            {alerts.length === 0 ? (
              <p className="text-gray-400">No alerts</p>
            ) : (
              alerts.map((a, i) => (
                <div
                  key={i}
                  className="text-xs p-2 bg-red-50 dark:bg-red-950/30 rounded mb-2"
                >
                  ⚠️ {a.message}
                </div>
              ))
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow space-y-2">
            <h3 className="font-bold">Quick Actions</h3>

            <button className="w-full bg-green-600 text-white py-2 rounded-xl text-sm">
              Accept Request
            </button>

            <button className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm">
              Update Status
            </button>

            <button className="w-full bg-red-600 text-white py-2 rounded-xl text-sm">
              Emergency Alert
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}