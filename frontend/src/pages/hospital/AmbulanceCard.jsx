import React, { useMemo } from "react";
import {
  Ambulance,
  User,
  Phone,
  Navigation,
  Clock,
  MapPin,
  HeartPulse,
  Activity,
  CheckCircle2,
} from "lucide-react";

const STATUS_COLORS = {
  ASSIGNED:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  EN_ROUTE:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  ARRIVED:
    "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  COMPLETED:
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function AmbulanceCard({
  ambulance = {},
  onViewMap,
  onCallDriver,
}) {
  const status = (ambulance.status || "UNKNOWN").toUpperCase();

  const statusClass =
    STATUS_COLORS[status] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  const safe = useMemo(
    () => ({
      vehicleNumber: ambulance.vehicleNumber || "N/A",
      driverName: ambulance.driverName || "Unknown Driver",
      patientName: ambulance.patientName || "Unknown Patient",
      emergencyType: ambulance.emergencyType || "General",
      eta: ambulance.eta ?? "--",
      speed: ambulance.speed ?? "--",
      location: ambulance.location || "Location not available",
    }),
    [ambulance]
  );

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5 hover:shadow-lg transition">

      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">

        <div className="flex items-center gap-4 min-w-0">

          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
            <Ambulance className="text-red-600" size={28} />
          </div>

          <div className="min-w-0">
            <h3 className="font-black text-lg truncate">
              {safe.vehicleNumber}
            </h3>

            <p className="text-sm text-gray-500 truncate">
              Driver • {safe.driverName}
            </p>
          </div>

        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusClass}`}
        >
          {status}
        </span>

      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-2 gap-4 mt-5">

        <div className="flex items-center gap-2">
          <User size={16} className="text-blue-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Patient</p>
            <p className="font-semibold truncate">{safe.patientName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HeartPulse size={16} className="text-red-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Emergency</p>
            <p className="font-semibold">{safe.emergencyType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">ETA</p>
            <p className="font-semibold">{safe.eta} mins</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity size={16} className="text-green-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Speed</p>
            <p className="font-semibold">{safe.speed} km/h</p>
          </div>
        </div>

      </div>

      {/* LOCATION */}
      <div className="mt-5 rounded-xl bg-gray-50 dark:bg-gray-800 p-3">

        <div className="flex items-start gap-2">

          <MapPin size={18} className="text-red-500 mt-1 shrink-0" />

          <div className="min-w-0">
            <p className="text-xs text-gray-500">Current Location</p>
            <p className="font-medium break-words">
              {safe.location}
            </p>
          </div>

        </div>

      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex gap-3 mt-5">

        <button
          onClick={() => onViewMap?.(ambulance)}
          className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 font-semibold transition"
        >
          <Navigation size={16} />
          View Live
        </button>

        <button
          onClick={() => onCallDriver?.(ambulance)}
          className="flex items-center justify-center gap-2 px-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Phone size={16} />
        </button>

      </div>

      {/* ARRIVED STATUS */}
      {status === "ARRIVED" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 px-3 py-2 text-green-700 dark:text-green-400 font-semibold">

          <CheckCircle2 size={18} />

          Ambulance has reached the hospital

        </div>
      )}

    </div>
  );
}