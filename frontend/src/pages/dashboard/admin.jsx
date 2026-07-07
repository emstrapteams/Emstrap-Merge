import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/user/StatCard";
import API from "../../services/api";
import toast from "react-hot-toast";

/* ---------------- LOADING SKELETON ---------------- */
const StatSkeleton = () => (
  <div className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
);

export default function Admin() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    ambulances: 0,
    police: 0,
    hospitals: 0,
    bookings: 0,
    emergencies: 0,
    activeTrips: 0,
    completedTrips: 0,
  });

  /* ---------------- FETCH DASHBOARD ---------------- */
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/dashboard");

      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ---------------- STAT CONFIG (CLEANER UI SCALING) ---------------- */
  const statItems = [
    { title: "Users", value: stats.users },
    { title: "Ambulances", value: stats.ambulances },
    { title: "Police Units", value: stats.police },
    { title: "Hospitals", value: stats.hospitals },
    { title: "Bookings", value: stats.bookings },
    { title: "Emergencies", value: stats.emergencies },
    { title: "Active Trips", value: stats.activeTrips },
    { title: "Completed Trips", value: stats.completedTrips },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black">
              Admin Dashboard
            </h1>
            <p className="text-gray-500">
              EMSTRAP Command & Control Center
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm"
          >
            Refresh
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <StatSkeleton key={i} />
              ))
            : statItems.map((item, i) => (
                <StatCard
                  key={i}
                  title={item.title}
                  value={item.value}
                />
              ))}

        </div>

        {/* CONTROL MODULES */}
        <div className="grid lg:grid-cols-3 gap-6">

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg mb-3">User Management</h2>

            <button className="w-full mb-2 py-2 rounded-xl bg-blue-600 text-white">
              Manage Users
            </button>

            <button className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
              View Reports
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg mb-3">Fleet Management</h2>

            <button className="w-full mb-2 py-2 rounded-xl bg-green-600 text-white">
              Ambulances
            </button>

            <button className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
              Drivers
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg mb-3">Emergency Control</h2>

            <button className="w-full mb-2 py-2 rounded-xl bg-red-600 text-white">
              Live Emergencies
            </button>

            <button className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
              Dispatch Logs
            </button>
          </div>

        </div>

        {/* ACTIVITY FEED */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
          <h2 className="font-bold text-lg mb-4">
            Recent System Activity
          </h2>

          <div className="space-y-3 text-sm">

            {[
              ["New Emergency Request", "2 min ago"],
              ["New Ambulance Registered", "18 min ago"],
              ["Police Unit Assigned", "42 min ago"],
              ["User Profile Updated", "1 hour ago"],
            ].map(([text, time], i) => (
              <div
                key={i}
                className="flex justify-between border-b pb-2 last:border-b-0"
              >
                <span>{text}</span>
                <span className="text-gray-500">{time}</span>
              </div>
            ))}

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}