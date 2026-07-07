import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import API from "../../services/api";
import toast from "react-hot-toast";

import {
  BedDouble,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Building2,
} from "lucide-react";

export default function BedAvailability() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalBeds: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    icuBeds: 0,
    icuAvailable: 0,
  });

  const [wards, setWards] = useState([]);

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      setLoading(true);

      const res = await API.get("/hospital/beds");

      if (res.data) {
        setStats(res.data.stats || {});
        setWards(res.data.wards || []);
      }
    } catch (err) {
      toast.error("Failed to load bed availability");
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => fetchBeds();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6 animate-pulse">
          <div className="h-10 w-80 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <BedDouble className="text-blue-600" />
              Bed Availability
            </h1>
            <p className="text-gray-500">
              Real-time hospital capacity monitoring
            </p>
          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow">
            <p className="text-sm text-gray-500">Total Beds</p>
            <h2 className="text-2xl font-black">{stats.totalBeds}</h2>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl">
            <p className="text-sm text-green-600">Available</p>
            <h2 className="text-2xl font-black text-green-700">
              {stats.availableBeds}
            </h2>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl">
            <p className="text-sm text-red-600">Occupied</p>
            <h2 className="text-2xl font-black text-red-700">
              {stats.occupiedBeds}
            </h2>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl">
            <p className="text-sm text-blue-600">ICU Available</p>
            <h2 className="text-2xl font-black text-blue-700">
              {stats.icuAvailable}
            </h2>
          </div>
        </div>

        {/* ALERT */}
        {stats.availableBeds === 0 && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertTriangle />
            No general beds available. Emergency overflow risk.
          </div>
        )}

        {/* WARDS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Building2 className="text-gray-600" />
            Ward Status
          </h2>

          {wards.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              No ward data available
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">

              {wards.map((ward, index) => (
                <div
                  key={index}
                  className="border rounded-2xl p-4 dark:border-gray-800 hover:shadow transition"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold">{ward.name}</h3>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        ward.available > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {ward.available > 0 ? "Available" : "Full"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 text-center text-sm">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-bold">{ward.total}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Occupied</p>
                      <p className="font-bold text-red-600">
                        {ward.occupied}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Free</p>
                      <p className="font-bold text-green-600">
                        {ward.available}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* ICU SECTION */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Activity className="text-red-500" />
            ICU Status
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <div className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-800">
              <p className="text-sm text-gray-500">Total ICU Beds</p>
              <p className="text-2xl font-black">{stats.icuBeds}</p>
            </div>

            <div className="p-5 rounded-2xl bg-green-100 dark:bg-green-900/20">
              <p className="text-sm text-green-600">Available ICU</p>
              <p className="text-2xl font-black text-green-700">
                {stats.icuAvailable}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-red-100 dark:bg-red-900/20">
              <p className="text-sm text-red-600">Occupied ICU</p>
              <p className="text-2xl font-black text-red-700">
                {stats.icuBeds - stats.icuAvailable}
              </p>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}