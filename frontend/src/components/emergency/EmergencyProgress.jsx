import { useMemo } from "react";
import {
  Search,
  Ambulance,
  MapPin,
  Hospital,
  CheckCircle2,
  User,
  Clock3,
  Car,
} from "lucide-react";

const STEPS = [
  {
    key: "PENDING",
    title: "Searching Ambulance",
    description: "Finding the nearest available ambulance",
    icon: Search,
  },
  {
    key: "AMBULANCE_ACCEPTED",
    title: "Ambulance Assigned",
    description: "Driver accepted your emergency request",
    icon: Ambulance,
  },
  {
    key: "ARRIVED_AT_LOCATION",
    title: "Driver Arrived",
    description: "Ambulance has reached your location",
    icon: MapPin,
  },
  {
    key: "EN_ROUTE_TO_HOSPITAL",
    title: "Heading to Hospital",
    description: "Patient is being transported",
    icon: Hospital,
  },
  {
    key: "COMPLETED",
    title: "Emergency Completed",
    description: "Emergency successfully completed",
    icon: CheckCircle2,
  },
];

function formatStatus(status = "") {
  return status
    .toString()
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function EmergencyProgress({
  status = "PENDING",
  driverName = "",
  hospitalName = "",
  eta = "--",
  ambulanceNo = "",
  updatedAt = "",
}) {
  const normalizedStatus = status?.toUpperCase?.() || "PENDING";

  const currentStep = useMemo(() => {
    const index = STEPS.findIndex((step) => step.key === normalizedStatus);
    return index >= 0 ? index : 0;
  }, [normalizedStatus]);

  const progress = useMemo(() => {
    return Math.min(
      100,
      Math.round(((currentStep + 1) / STEPS.length) * 100)
    );
  }, [currentStep]);

  const currentLabel = useMemo(() => {
    return formatStatus(normalizedStatus);
  }, [normalizedStatus]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Ambulance size={28} />
          Emergency Progress
        </h2>

        <p className="text-red-100 mt-2">
          Live tracking of your emergency request
        </p>

        {/* Progress */}
        <div className="mt-5">
          <div className="h-3 rounded-full bg-red-300 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm mt-2">
            {progress}% Completed
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="space-y-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;

            const completed = index < currentStep;
            const active = index === currentStep;

            return (
              <div key={step.key} className="relative flex gap-5">

                {index !== STEPS.length - 1 && (
                  <div
                    className={`absolute left-5 top-12 w-1 h-full rounded-full
                    ${completed
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                )}

                <div
                  className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all
                  ${
                    completed
                      ? "bg-green-500 text-white"
                      : active
                      ? "bg-red-600 text-white ring-4 ring-red-200 animate-pulse"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3
                      className={`font-bold text-lg
                      ${
                        completed
                          ? "text-green-600"
                          : active
                          ? "text-red-600"
                          : "text-gray-700 dark:text-white"
                      }`}
                    >
                      {step.title}
                    </h3>

                    {active && (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 mt-1">
                    {step.description}
                  </p>

                  {completed && (
                    <p className="text-green-600 text-sm mt-2 font-semibold">
                      ✓ Completed
                    </p>
                  )}

                  {active && (
                    <p className="text-red-500 text-sm mt-2 animate-pulse">
                      Processing...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mt-10">
          <InfoCard icon={<User size={22} />} title="Driver" value={driverName || "Searching..."} />
          <InfoCard icon={<Car size={22} />} title="Ambulance" value={ambulanceNo || "--"} />
          <InfoCard icon={<Clock3 size={22} />} title="ETA" value={eta || "--"} valueClass="text-red-600" />
          <InfoCard icon={<Hospital size={22} />} title="Hospital" value={hospitalName || "Waiting..."} />
        </div>

        {/* Footer */}
        <div className="mt-8 border-t dark:border-gray-700 pt-5 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <h3 className="font-bold text-red-600 text-lg">
              {currentLabel}
            </h3>
          </div>

          <div className="md:text-right">
            <p className="text-sm text-gray-500">Last Updated</p>
            <h3 className="font-semibold">
              {updatedAt || "Live"}
            </h3>
          </div>
        </div>

      </div>
    </div>
  );
}

function InfoCard({ icon, title, value, valueClass = "" }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5 hover:shadow-lg transition">
      <div className="flex items-center gap-3 text-red-600 mb-3">
        {icon}
        <span className="text-sm font-semibold uppercase tracking-wide">
          {title}
        </span>
      </div>

      <h3 className={`text-lg font-bold break-words text-gray-900 dark:text-white ${valueClass}`}>
        {value}
      </h3>
    </div>
  );
}