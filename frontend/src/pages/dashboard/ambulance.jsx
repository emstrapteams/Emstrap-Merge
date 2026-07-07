import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/user/StatCard";
import API from "../../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Navigation,
  Phone,
  Activity,
  CheckCircle,
  Clock,
  Siren,
  Loader2,
} from "lucide-react";

export default function AmbulanceDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    emergencies: 0,
    onlineHours: 0,
  });

  const [currentTrip, setCurrentTrip] = useState(null);

  /* ---------------- FETCH DASHBOARD ---------------- */
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await API.get("/ambulance/dashboard");

      if (res?.data) {
        setStats(res.data.stats || {
          assigned: 0,
          completed: 0,
          emergencies: 0,
          onlineHours: 0,
        });

        setCurrentTrip(res.data.currentTrip || null);
      }

    } catch (err) {
      toast.error("Unable to load ambulance dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ---------------- LOADING UI ---------------- */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="animate-spin mb-3" />
          Loading ambulance dashboard...
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
            <h1 className="text-3xl font-black">
              Ambulance Dashboard
            </h1>
            <p className="text-gray-500">
              Emergency Response Control Panel
            </p>
          </div>

          <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold">
            ONLINE
          </span>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

          <StatCard title="Assigned" value={stats.assigned} />
          <StatCard title="Completed" value={stats.completed} />
          <StatCard title="Emergencies" value={stats.emergencies} />
          <StatCard title="Online Hours" value={`${stats.onlineHours}h`} />

        </div>

        {/* ACTIVE TRIP */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">

          <h2 className="font-bold text-xl mb-5 flex items-center gap-2">
            <Siren className="text-red-500" />
            Active Emergency
          </h2>

          {!currentTrip ? (
            <div className="text-gray-400 text-center py-10">
              No active assignment.
            </div>
          ) : (
            <div className="space-y-5">

              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-gray-400 uppercase">Patient</p>
                  <p className="font-bold">
                    {currentTrip.patientName || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase">Mobile</p>
                  <p className="font-bold">
                    {currentTrip.mobile || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase">Pickup</p>
                  <p>{currentTrip.pickup || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase">Destination</p>
                  <p>{currentTrip.destination || "N/A"}</p>
                </div>

              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3">

                <Link
                  to={`/tracking/${currentTrip.requestId}`}
                  className="px-5 py-3 rounded-xl bg-green-600 text-white font-bold flex items-center gap-2"
                >
                  <Navigation size={18} />
                  Live Navigation
                </Link>

                <a
                  href={`tel:${currentTrip.mobile || ""}`}
                  className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-2"
                >
                  <Phone size={18} />
                  Call Patient
                </a>

              </div>

            </div>
          )}

        </div>

        {/* QUICK ACTIONS (READY FOR SOCKET INTEGRATION) */}
        <div className="grid md:grid-cols-4 gap-5">

          <button className="rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-white p-5 font-bold transition">
            Accept Job
          </button>

          <button className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white p-5 font-bold transition">
            Arrived
          </button>

          <button className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white p-5 font-bold transition">
            Patient Picked
          </button>

          <button className="rounded-2xl bg-green-600 hover:bg-green-700 text-white p-5 font-bold transition">
            Complete Trip
          </button>

        </div>

        {/* PERFORMANCE */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">

          <h2 className="font-bold text-xl mb-4">
            Today's Performance
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <div className="p-5 rounded-xl bg-gray-100 dark:bg-gray-800">
              <Activity className="mb-3 text-red-500" />
              <h3 className="font-bold">Distance Covered</h3>
              <p className="text-2xl font-black mt-2">82 km</p>
            </div>

            <div className="p-5 rounded-xl bg-gray-100 dark:bg-gray-800">
              <Clock className="mb-3 text-blue-500" />
              <h3 className="font-bold">Duty Time</h3>
              <p className="text-2xl font-black mt-2">8h 35m</p>
            </div>

            <div className="p-5 rounded-xl bg-gray-100 dark:bg-gray-800">
              <CheckCircle className="mb-3 text-green-500" />
              <h3 className="font-bold">Success Rate</h3>
              <p className="text-2xl font-black mt-2">98%</p>
            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}