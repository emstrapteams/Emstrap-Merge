import { useEffect, useMemo, useRef, useState } from "react";
import socket, { connectSocket, disconnectSocket } from "../../app/socket";
import LiveTrackingMap from "../../components/map/LiveTrackingMap";

import {
  getEmergencies,
  getHospitals,
  getPoliceUnits,
  getAmbulances,
  getErrorMessage
} from "../../services/api";

/* ---------------- CONFIG ---------------- */

const INCIDENT_TYPES = ["Fire", "Accident", "Medical", "Crime", "Flood"];

const SEVERITY = {
  CRITICAL: "text-rose-500",
  HIGH: "text-amber-500",
  MEDIUM: "text-blue-400",
  LOW: "text-slate-400"
};

/* ---------------- HELPERS ---------------- */

const timeAgo = (t) => {
  if (!t) return "";
  const diff = Date.now() - new Date(t).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
};

const severityColor = (s) =>
  SEVERITY[s?.toUpperCase()] || SEVERITY.MEDIUM;

/* ---------------- UI ---------------- */

function Panel({ title, children }) {
  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl">
      <div className="px-3 py-2 text-xs font-bold uppercase text-slate-400 border-b border-slate-900">
        {title}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

/* ---------------- MAIN ---------------- */

export default function AdminDashboard() {
  const socketRef = useRef(null);

  const [now, setNow] = useState(new Date());
  const [connected, setConnected] = useState(false);

  const [emergencies, setEmergencies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [police, setPolice] = useState([]);
  const [ambulances, setAmbulances] = useState([]);

  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState(
    INCIDENT_TYPES.reduce((a, t) => ({ ...a, [t]: true }), {})
  );

  /* ---------------- CLOCK ---------------- */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const [e, h, p, a] = await Promise.all([
          getEmergencies(),
          getHospitals(),
          getPoliceUnits(),
          getAmbulances()
        ]);

        setEmergencies(e || []);
        setHospitals(h || []);
        setPolice(p || []);
        setAmbulances(a || []);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load data"));
      }
    })();
  }, []);

  /* ---------------- SOCKET SYNC ---------------- */
  useEffect(() => {
    connectSocket();
    socketRef.current = socket;

    const upsert = (setter) => (item) => {
      if (!item || !item._id) return;
      setter((prev) => {
        const exists = prev.find((x) => x._id === item._id);
        if (exists) {
          return prev.map((x) => (x._id === item._id ? { ...x, ...item } : x));
        }
        return [item, ...prev];
      });
    };

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.emit("join_admin");

    socket.on("emergency_created", upsert(setEmergencies));
    socket.on("booking_created", upsert(setEmergencies));
    socket.on("emergency_updated", upsert(setEmergencies));
    socket.on("emergency_completed", (d) =>
      setEmergencies((p) => p.filter((x) => x._id !== d.requestId))
    );
    socket.on("booking_completed", (d) =>
      setEmergencies((p) => p.filter((x) => x._id !== d.bookingId))
    );

    socket.on("ambulance_location", upsert(setAmbulances));

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("emergency_created");
      socket.off("booking_created");
      socket.off("emergency_updated");
      socket.off("emergency_completed");
      socket.off("booking_completed");
      socket.off("ambulance_location");
    };
  }, []);

  /* ---------------- FILTERED DATA ---------------- */
  const filtered = useMemo(
    () => emergencies.filter((e) => filters[e.incidentType]),
    [emergencies, filters]
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [filtered]
  );

  const active = selected || sorted[0];

  /* ---------------- FIXED GOOGLE MAP NAVIGATION ---------------- */
  const openGoogleMaps = (e) => {
    const lat = e?.location?.lat || e?.lat;
    const lng = e?.location?.lng || e?.lng;

    if (!lat || !lng) return;

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  /* ---------------- STATS ---------------- */
  const stats = useMemo(() => {
    const resolved = emergencies.filter((e) => e.status === "resolved").length;
    return {
      total: emergencies.length,
      resolved,
      active: emergencies.length - resolved
    };
  }, [emergencies]);

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center border border-slate-900 p-3 rounded-xl">
        <div>
          <div className="font-bold">EMSTRAP COMMAND CENTER</div>
          <div className="text-xs text-slate-500">
            {now.toLocaleTimeString()}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
          {connected ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      {error && <div className="text-red-400 text-xs">{error}</div>}

      {/* STATS */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <Panel title="Total">{stats.total}</Panel>
        <Panel title="Active">{stats.active}</Panel>
        <Panel title="Resolved">{stats.resolved}</Panel>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* MAP */}
        <div className="xl:col-span-2 h-[650px] rounded-xl overflow-hidden border border-slate-900">
          <LiveTrackingMap
            emergency={active}
            vehicles={ambulances}
            responders={[...hospitals, ...police]}
          />
        </div>

        {/* SIDEBAR */}
        <div className="space-y-3">

          <Panel title={`Incidents (${sorted.length})`}>
            <div className="space-y-2 max-h-64 overflow-y-auto">

              {sorted.map((e) => (
                <div
                  key={e._id}
                  onClick={() => setSelected(e)}
                  className="p-2 border border-slate-900 rounded cursor-pointer"
                >
                  <div className="flex justify-between">
                    <div className={severityColor(e.severity)}>
                      {e.incidentType}
                    </div>

                    <span className="text-xs text-slate-500">
                      {timeAgo(e.createdAt)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 truncate">
                    {e.address}
                  </div>

                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      openGoogleMaps(e);
                    }}
                    className="text-xs mt-1 text-green-400"
                  >
                    📍 Navigate
                  </button>
                </div>
              ))}
            </div>
          </Panel>

          {/* FILTERS */}
          <Panel title="Filters">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {INCIDENT_TYPES.map((t) => (
                <label key={t} className="flex justify-between">
                  {t}
                  <input
                    type="checkbox"
                    checked={filters[t]}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, [t]: e.target.checked }))
                    }
                  />
                </label>
              ))}
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
}