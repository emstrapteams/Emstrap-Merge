import React, { useMemo } from "react";
import {
  Clock,
  MapPin,
  Hospital,
  User,
  CheckCircle,
  IndianRupee,
  Route,
} from "lucide-react";

export default function DriverHistory({ history = [] }) {
  const safeHistory = Array.isArray(history) ? history : [];

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === "") return "--";
    return Number(num).toFixed(1);
  };

  if (safeHistory.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 text-center">
        <Clock size={42} className="mx-auto text-gray-400 mb-3" />
        <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200">
          No Trip History
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          Completed ambulance trips will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="px-6 py-4 border-b dark:border-gray-800">
        <h2 className="text-xl font-black">Trip History</h2>
        <p className="text-sm text-gray-500 mt-1">
          Previous completed ambulance trips
        </p>
      </div>

      {/* LIST */}
      <div className="divide-y dark:divide-gray-800">

        {safeHistory.map((trip) => (
          <div
            key={trip._id || Math.random()}
            className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
          >

            <div className="flex flex-col lg:flex-row justify-between gap-5">

              {/* LEFT SIDE */}
              <div className="space-y-2 flex-1">

                {/* Patient */}
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  <span className="font-semibold">
                    {trip.patientName || "Unknown Patient"}
                  </span>
                </div>

                {/* Pickup */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={15} />
                  {trip.pickup || "-"}
                </div>

                {/* Hospital */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Hospital size={15} />
                  {trip.hospital || "-"}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={15} />
                  {formatDate(trip.completedAt)}
                </div>

              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col items-start lg:items-end gap-3">

                {/* STATUS */}
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <CheckCircle size={18} />
                  {trip.status || "COMPLETED"}
                </div>

                {/* DISTANCE */}
                <div className="flex items-center gap-2 text-sm">
                  <Route size={15} className="text-indigo-500" />
                  {formatNumber(trip.distance)} km
                </div>

                {/* FARE */}
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                  <IndianRupee size={15} />
                  {trip.fare ?? 0}
                </div>

              </div>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}