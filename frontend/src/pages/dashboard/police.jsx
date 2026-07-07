import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/user/StatCard";
import API from "../../services/api";
import toast from "react-hot-toast";
import {
  Shield,
  AlertTriangle,
  MapPin,
  Clock,
  Radio,
  Loader2,
} from "lucide-react";

export default function PoliceDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    activeIncidents: 0,
    resolvedIncidents: 0,
    criticalCases: 0,
    patrolUnits: 0,
  });

  const [incidents, setIncidents] = useState([]);
  const [unitStats, setUnitStats] = useState({
    active: 0,
    patrol: 0,
    emergency: 0,
  });

  /* ---------------- FETCH ---------------- */
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await API.get("/police/dashboard");

      if (res?.data) {
        setStats(res.data.stats || {
          activeIncidents: 0,
          resolvedIncidents: 0,
          criticalCases: 0,
          patrolUnits: 0,
        });

        setIncidents(res.data.recentIncidents || []);
        setUnitStats(res.data.unitStats || {
          active: 0,
          patrol: 0,
          emergency: 0,
        });
      }

    } catch (err) {
      toast.error("Failed to load police dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="animate-spin mb-3" />
          Loading command center...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <Shield className="text-blue-600" />
              Police Command Center
            </h1>
            <p className="text-gray-500">
              Real-time Incident Monitoring & Response
            </p>
          </div>

          <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center gap-2">
            <Radio size={14} />
            LIVE
          </span>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

          <StatCard title="Active Incidents" value={stats.activeIncidents} />
          <StatCard title="Resolved" value={stats.resolvedIncidents} />
          <StatCard title="Critical Cases" value={stats.criticalCases} />
          <StatCard title="Patrol Units" value={stats.patrolUnits} />

        </div>

        {/* QUICK ACTIONS */}
        <div className="grid md:grid-cols-3 gap-5">

          <button className="bg-red-600 hover:bg-red-700 text-white p-5 rounded-2xl font-bold transition">
            🚨 Dispatch Emergency Unit
          </button>

          <button className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-bold transition">
            📡 Broadcast Alert
          </button>

          <button className="bg-gray-800 hover:bg-gray-900 text-white p-5 rounded-2xl font-bold transition">
            🛰 View Live Map
          </button>

        </div>

        {/* INCIDENT LIST */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">

          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Recent Incidents
          </h2>

          {incidents.length === 0 ? (
            <div className="text-gray-400 text-center py-10">
              No active incidents
            </div>
          ) : (
            <div className="space-y-4">

              {incidents.map((incident) => (
                <div
                  key={incident._id}
                  className="p-4 border rounded-xl flex justify-between items-center"
                >

                  <div>
                    <p className="font-bold">
                      {incident.type || "Unknown Incident"}
                    </p>

                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <MapPin size={12} />
                      {incident.location || "Unknown location"}
                    </p>

                    <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                      <Clock size={12} />
                      {incident.time || "Just now"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        incident.priority === "HIGH"
                          ? "bg-red-100 text-red-600"
                          : incident.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {incident.priority || "LOW"}
                    </span>

                    <button className="block mt-2 text-xs text-blue-600 font-bold">
                      Open Case
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

        {/* UNIT STATUS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">

          <h2 className="font-bold text-xl mb-4">
            Patrol Unit Status
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <h3 className="font-bold">Active Units</h3>
              <p className="text-2xl font-black">{unitStats.active}</p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <h3 className="font-bold">On Patrol</h3>
              <p className="text-2xl font-black">{unitStats.patrol}</p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <h3 className="font-bold">Emergency Dispatch</h3>
              <p className="text-2xl font-black">{unitStats.emergency}</p>
            </div>

          </div>
        </div>

      </div>

    </DashboardLayout>
  );
}