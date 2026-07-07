import { Fragment, useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";

import { API_URL, getAlerts, getOverviewStats } from "../../services/api";
import socket, { connectSocket } from "../../app/socket";

/* ---------------- ICONS ---------------- */
const createCustomIcon = (emoji, color = "#ef4444") =>
  L.divIcon({
    html: `
      <div style="border:2px solid ${color}" 
        class="bg-white rounded-full p-2 text-xl shadow-lg flex items-center justify-center">
        ${emoji}
      </div>
    `,
    className: "custom-leaflet-icon",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

const emergencyIcon = createCustomIcon("🚑", "#ef4444");
const patientIcon = createCustomIcon("👤", "#3b82f6");

const ACTIVE_TRACKING_STATUSES = ["pending", "assigned", "enroute", "arrived"];

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { animate: true, duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function LiveMap({ incidents: propIncidents, ambulanceLocations: propAmbLocations, onNavigate }) {
  const [alerts, setAlerts] = useState(propIncidents || []);
  const [ambulanceLocations, setAmbulanceLocations] = useState(propAmbLocations || {});
  const [liveAmbulancesCount, setLiveAmbulancesCount] = useState(0);

  /* This component is used standalone (Hospital) or by Police */
  const isStandalone = !propIncidents;

  useEffect(() => {
    if (!isStandalone) {
      setAlerts(propIncidents || []);
      return;
    }

    // Hospital standalone mode
    const init = async () => {
      try {
        const res = await getAlerts();
        if (res.success) {
          setAlerts(res.alerts.filter((a) => ACTIVE_TRACKING_STATUSES.includes(a.status)));
        }
        const stats = await getOverviewStats();
        if (stats?.liveAmbulances !== undefined) {
          setLiveAmbulancesCount(stats.liveAmbulances);
        }
      } catch (err) {
        toast.error("Failed to load map data");
      }
    };

    init();

    connectSocket();
    socket.emit("join_hospital", {});

    const handleHospitalAlert = (data) => {
      const req = data.request;
      if (!req?._id) return;
      toast.success("🏥 New emergency alert received");

      setAlerts((prev) => {
        const exists = prev.find((a) => a._id === req._id);
        if (exists) {
          if (!ACTIVE_TRACKING_STATUSES.includes(req.status)) {
            return prev.filter((a) => a._id !== req._id);
          }
          return prev.map((a) => (a._id === req._id ? req : a));
        }
        if (!ACTIVE_TRACKING_STATUSES.includes(req.status)) return prev;
        return [req, ...prev];
      });
    };

    const handleAmbulanceLocation = (data) => {
      setAmbulanceLocations((prev) => ({
        ...prev,
        [data.requestId || data.driverId]: {
          lat: data.location?.latitude ?? data.latitude,
          lng: data.location?.longitude ?? data.longitude,
        },
      }));
      setLiveAmbulancesCount((n) => Math.max(n, Object.keys(ambulanceLocations).length + 1));
    };

    socket.on("hospital_alert", handleHospitalAlert);
    socket.on("ambulance_location", handleAmbulanceLocation);

    return () => {
      socket.off("hospital_alert", handleHospitalAlert);
      socket.off("ambulance_location", handleAmbulanceLocation);
    };
  }, [isStandalone]);

  // When used by Police, sync prop changes
  useEffect(() => {
    if (!isStandalone && propAmbLocations) {
      setAmbulanceLocations(propAmbLocations);
    }
  }, [propAmbLocations, isStandalone]);

  const center = useMemo(() => {
    if (alerts.length > 0 && alerts[0]?.location) {
      // Schema: location.coordinates.lat / lng
      const coords = alerts[0].location?.coordinates;
      if (coords?.lat && coords?.lng) return [coords.lat, coords.lng];
      // Fallback for old schema
      if (alerts[0].location?.latitude) return [alerts[0].location.latitude, alerts[0].location.longitude];
    }
    return [20.5937, 78.9629];
  }, [alerts]);

  /* Navigate button handler */
  const handleNavigate = (alert) => {
    if (onNavigate) { onNavigate(alert); return; }
    const coords = alert?.location?.coordinates;
    const lat = coords?.lat || alert?.location?.latitude;
    const lng = coords?.lng || alert?.location?.longitude;
    if (!lat || !lng) { toast.error("No location available"); return; }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl">

      {/* HUD */}
      {isStandalone && (
        <div className="absolute top-6 left-6 z-[900] bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl text-center min-w-[12rem]">
          <h3 className="text-xs font-black text-slate-300 uppercase">Active Ambulances</h3>
          <p className="text-4xl font-black text-green-400">{liveAmbulancesCount}</p>
          <p className="text-[10px] text-slate-500 uppercase mt-1">Live Tracking</p>
        </div>
      )}

      {/* LEGEND */}
      <div className="absolute top-6 right-6 z-[900] bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span> Ambulance
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Patient
        </div>
      </div>

      {/* MAP */}
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <RecenterMap center={center} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap"
        />

        {alerts.map((alert) => {
          const ambLoc = ambulanceLocations[alert._id] || ambulanceLocations[alert.ambulance?._id];
          const coords = alert.location?.coordinates;
          const patLat = coords?.lat || alert.location?.latitude;
          const patLng = coords?.lng || alert.location?.longitude;

          return (
            <Fragment key={alert._id}>
              {patLat && patLng && (
                <Marker position={[patLat, patLng]} icon={patientIcon}>
                  <Popup>
                    <p className="font-bold">Patient: {alert.user?.name || "Unknown"}</p>
                    <p className="text-xs">Status: {alert.status}</p>
                    <button
                      onClick={() => handleNavigate(alert)}
                      className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      🗺️ Navigate Here
                    </button>
                  </Popup>
                </Marker>
              )}
              {ambLoc && (
                <Marker position={[ambLoc.lat, ambLoc.lng]} icon={emergencyIcon}>
                  <Popup>
                    <p className="font-bold">Ambulance: {alert.ambulance?.vehicleNumber || "Fleet"}</p>
                    <p className="text-xs text-red-500">Live Tracking Active</p>
                  </Popup>
                </Marker>
              )}
            </Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}