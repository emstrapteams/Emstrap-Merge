import React, { useMemo } from "react";

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Requested" },
  { key: "ACCEPTED", label: "Driver Assigned" },
  { key: "EN_ROUTE", label: "En Route" },
  { key: "ARRIVED", label: "At Pickup" },
  { key: "PATIENT_PICKED", label: "Onboard" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
];

// fast lookup for sync stability
const STEP_INDEX = TIMELINE_STEPS.reduce((acc, step, i) => {
  acc[step.key] = i;
  return acc;
}, {});

export default function BookingTimeline({ status }) {
  const normalizedStatus = status?.toUpperCase?.();

  const currentIndex = useMemo(() => {
    if (!normalizedStatus) return -1;
    return STEP_INDEX[normalizedStatus] ?? -1;
  }, [normalizedStatus]);

  const isCancelled = normalizedStatus === "CANCELLED";

  const progressPercent = useMemo(() => {
    if (currentIndex <= 0) return 0;
    if (currentIndex >= TIMELINE_STEPS.length - 1) return 100;

    return (currentIndex / (TIMELINE_STEPS.length - 1)) * 100;
  }, [currentIndex]);

  if (!normalizedStatus) return null;

  if (isCancelled) {
    return (
      <div className="text-xs font-bold text-red-500">
        🚫 Request Cancelled
      </div>
    );
  }

  return (
    <div className="relative w-full py-4">

      {/* BACK LINE */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />

      {/* ACTIVE LINE (smooth sync) */}
      <div
        className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-700 ease-out"
        style={{ width: `${progressPercent}%` }}
      />

      {/* STEPS */}
      <div className="flex justify-between relative z-10">
        {TIMELINE_STEPS.map((step, index) => {
          const isDone = currentIndex >= index && currentIndex !== -1;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">

              {/* NODE */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                  isDone
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                } ${
                  isCurrent
                    ? "ring-4 ring-blue-100 dark:ring-blue-900 scale-110"
                    : ""
                }`}
              >
                {isDone ? "✓" : index + 1}
              </div>

              {/* LABEL */}
              <span
                className={`mt-1 text-[10px] font-bold text-center transition-colors ${
                  isCurrent ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>

            </div>
          );
        })}
      </div>
    </div>
  );
}