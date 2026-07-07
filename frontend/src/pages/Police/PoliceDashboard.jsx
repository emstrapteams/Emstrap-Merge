import { useEffect, useRef, useState } from "react";

// Fixed import paths — files exist directly in /Police/, not /Police/components/
import PoliceHeader from "./PoliceHeader";
import StatusCards from "./StatusCards";
import LiveMap from "./LiveMap";
import IncidentList from "./IncidentList";
import IncidentModal from "./IncidentModal";
import NotificationPanel from "./NotificationPanel";
import AnalyticsPanel from "./AnalyticsPanel";

// API & Socket
import { fetchIncidentsAPI } from "../../services/api";
import socket, { connectSocket } from "../../app/socket";
import toast from "react-hot-toast";

export default function PoliceDashboard() {
  // ================= STATE =================
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [ambulanceLocations, setAmbulanceLocations] = useState({});

  const [caseNotes, setCaseNotes] = useState({});

  const [socketConnected, setSocketConnected] = useState(false);
  const [latency] = useState(42);

  const [systemClock, setSystemClock] = useState(new Date());
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const [mapLayer, setMapLayer] = useState("road");
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const [liveNotifications, setLiveNotifications] = useState([]);

  // ================= FETCH =================
  const loadIncidents = async () => {
    try {
      const res = await fetchIncidentsAPI();
      const data = res.data || [];

      setIncidents(data);
      setFilteredIncidents(data);
      setLastSyncTime(new Date());
    } catch (err) {
      toast.error("Failed to load incidents");
    }
  };

  useEffect(() => {
    loadIncidents();

    // Socket connection
    connectSocket();
    socket.emit("join_police");

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    setSocketConnected(socket.connected);

    // New emergency from backend
    socket.on("police_new_case", (data) => {
      const item = data?.request || data;
      if (!item?._id) return;
      toast.success("🚨 New emergency case received");
      setLiveNotifications((prev) => [item, ...prev].slice(0, 20));
      setIncidents((prev) => {
        const exists = prev.find((x) => x._id === item._id);
        if (exists) return prev.map((x) => (x._id === item._id ? { ...x, ...item } : x));
        return [item, ...prev];
      });
      setFilteredIncidents((prev) => {
        const exists = prev.find((x) => x._id === item._id);
        if (exists) return prev.map((x) => (x._id === item._id ? { ...x, ...item } : x));
        return [item, ...prev];
      });
    });

    // Live ambulance location updates
    socket.on("ambulance_location", (data) => {
      if (!data?.driverId) return;
      setAmbulanceLocations((prev) => ({
        ...prev,
        [data.driverId]: {
          lat: data.location?.latitude ?? data.latitude,
          lng: data.location?.longitude ?? data.longitude,
        },
      }));
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("police_new_case");
      socket.off("ambulance_location");
    };
  }, []);

  // ================= CLOCK =================
  useEffect(() => {
    const timer = setInterval(() => setSystemClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ================= GOOGLE MAPS NAVIGATION =================
  const openGoogleMaps = (incident) => {
    const lat = incident?.location?.coordinates?.lat || incident?.location?.latitude;
    const lng = incident?.location?.coordinates?.lng || incident?.location?.longitude;
    if (!lat || !lng) { toast.error("No location data"); return; }
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col gap-4 p-4">

      {/* HEADER */}
      <PoliceHeader
        systemClock={systemClock}
        latency={latency}
        incidents={incidents}
        lastSyncTime={lastSyncTime}
        socketConnected={socketConnected}
      />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

        {/* LEFT PANEL */}
        <div className="xl:col-span-3 flex flex-col gap-4">

          {/* STATUS */}
          <StatusCards
            systemClock={systemClock}
            latency={latency}
            incidents={incidents}
          />

          {/* MAP — uses LiveMap which has ambulance locations */}
          <LiveMap
            incidents={filteredIncidents}
            ambulanceLocations={ambulanceLocations}
            onNavigate={openGoogleMaps}
          />

          {/* INCIDENT LIST with Navigate button */}
          <IncidentList
            incidents={filteredIncidents}
            setSelectedCase={setSelectedCase}
            onNavigate={openGoogleMaps}
          />

          {/* ANALYTICS */}
          <AnalyticsPanel incidents={incidents} />

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="xl:col-span-1">
          <NotificationPanel liveNotifications={liveNotifications} />
        </div>

      </div>

      {/* MODAL */}
      {selectedCase && (
        <IncidentModal
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
          caseNotes={caseNotes}
          setCaseNotes={setCaseNotes}
        />
      )}

    </div>
  );
}