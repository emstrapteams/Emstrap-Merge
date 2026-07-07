import React from "react";
import { Link } from "react-router-dom";
import { Clock, Siren, Truck, User } from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  ACCEPTED: { classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  EN_ROUTE: { classes: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400" },
  ARRIVED: { classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  PATIENT_PICKED: { classes: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  IN_PROGRESS: { classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  COMPLETED: { classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Requested" },
  { key: "ACCEPTED", label: "Driver Assigned" },
  { key: "EN_ROUTE", label: "En Route" },
  { key: "ARRIVED", label: "At Pickup" },
  { key: "PATIENT_PICKED", label: "Onboard" },
  { key: "COMPLETED", label: "Completed" },
];

export default function BookingCard({
  booking,
  parseElapsedTime,
  onCancel,
  cancelLoading,
}) {
  if (!booking) return null;

  const b = booking;

  const currentCfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;

  const isOperative = !["COMPLETED", "CANCELLED"].includes(b.status);
  const isCancelable = ["PENDING", "ACCEPTED"].includes(b.status);

  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.key === b.status);

  return (
    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex flex-col gap-5">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">

        <div className="flex gap-3 items-start">
          <span className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            b.isEmergency
              ? "bg-red-100 text-red-600 dark:bg-red-950/40"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700"
          }`}>
            {b.isEmergency ? <Siren size={22} /> : <Truck size={22} />}
          </span>

          <div>
            <h3 className="font-black text-lg uppercase">
              {b.ambulanceType || "Standard"}{" "}
              {b.emergencyType ? `• ${b.emergencyType}` : ""}
            </h3>

            <div className="text-xs text-gray-500 flex gap-2 items-center">
              <span>#{b._id?.substring(0, 8)?.toUpperCase()}</span>
              <Clock size={12} />
              {parseElapsedTime?.(b.createdAt)}
            </div>

            <div className="text-sm text-gray-500 mt-1">
              <div>
                <span className="font-bold text-xs">Pickup:</span>{" "}
                {b.pickupLocation?.address || "N/A"}
              </div>

              {!b.isEmergency && (
                <div>
                  <span className="font-bold text-xs">Drop:</span>{" "}
                  {b.dropoffLocation?.address || "N/A"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-2xl font-black">
            {b.estimatedPrice ? `₹${b.estimatedPrice}` : "FREE"}
          </div>

          <span className={`px-3 py-1 text-xs font-bold rounded-full ${currentCfg.classes}`}>
            {(b.status || "PENDING").replace("_", " ")}
          </span>
        </div>
      </div>

      {/* TIMELINE */}
      {b.status !== "CANCELLED" && (
        <div className="flex justify-between text-center text-xs">

          {TIMELINE_STEPS.map((step, i) => {
            const done = currentIdx !== -1 && i <= currentIdx;

            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  done ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
                }`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className="mt-1">{step.label}</span>
              </div>
            );
          })}

        </div>
      )}

      {/* DRIVER */}
      {b.driver ? (
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {b.driver.profileImage ? (
              <img
                src={b.driver.profileImage}
                alt={b.driver.name || "Driver"}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={16} />
            )}
          </div>

          <div>
            <div className="font-bold text-sm">{b.driver.name || "Unknown Driver"}</div>
            <div className="text-xs text-gray-500">
              {b.driver.vehicleModel || "Vehicle"} • {b.driver.plateNumber || "N/A"}
            </div>
          </div>

        </div>
      ) : (
        <div className="text-xs text-gray-400">
          Waiting for assignment...
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2">

        {isOperative && b.requestId && (
          <Link
            to={`/tracking/${b.requestId}`}
            className="bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold"
          >
            Track Live
          </Link>
        )}

        {b.driver?.phone && isOperative && (
          <a
            href={`tel:${b.driver.phone}`}
            className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl text-xs font-bold"
          >
            Call
          </a>
        )}

        {b.status === "COMPLETED" && (
          <button className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl text-xs font-bold">
            Receipt
          </button>
        )}

        {isCancelable && (
          <button
            disabled={cancelLoading?.[b._id]}
            onClick={() => onCancel?.(b._id)}
            className="text-red-500 text-xs font-bold disabled:opacity-40"
          >
            {cancelLoading?.[b._id] ? "Cancelling..." : "Abort"}
          </button>
        )}

      </div>
    </div>
  );
}