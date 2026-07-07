import React, { useMemo } from "react";
import {
  AlertTriangle,
  Siren,
  Ambulance,
  Hospital,
  Wifi,
  CheckCircle2,
  Clock,
} from "lucide-react";

const DEFAULT_ALERTS = [
  {
    id: 1,
    type: "emergency",
    title: "Critical Emergency Incoming",
    message: "Trauma patient arriving in approximately 6 minutes.",
    time: "Just now",
    priority: "critical",
  },
  {
    id: 2,
    type: "ambulance",
    title: "Ambulance Assigned",
    message: "Ambulance KA-01-AB-1234 is en route.",
    time: "2 min ago",
    priority: "high",
  },
  {
    id: 3,
    type: "beds",
    title: "ICU Capacity Warning",
    message: "Only 2 ICU beds are currently available.",
    time: "5 min ago",
    priority: "medium",
  },
  {
    id: 4,
    type: "system",
    title: "Live Tracking Connected",
    message: "Socket server connected successfully.",
    time: "10 min ago",
    priority: "low",
  },
];

/* ---------------- ICON MAP ---------------- */
const ICONS = {
  emergency: <Siren size={20} className="text-red-600" />,
  ambulance: <Ambulance size={20} className="text-blue-600" />,
  beds: <Hospital size={20} className="text-orange-500" />,
  system: <Wifi size={20} className="text-green-600" />,
};

/* ---------------- PRIORITY STYLES ---------------- */
const PRIORITY_STYLES = {
  critical: "border-red-500 bg-red-50 dark:bg-red-950/20",
  high: "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
  medium: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
  low: "border-green-500 bg-green-50 dark:bg-green-950/20",
};

const PRIORITY_BADGE = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-green-600 text-white",
};

export default function AlertsPanel({
  alerts = DEFAULT_ALERTS,
  socketConnected = true,
}) {
  const safeAlerts = useMemo(() => alerts || [], [alerts]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">

      {/* HEADER */}
      <div className="flex items-center justify-between p-5 border-b dark:border-gray-800">
        <div>
          <h2 className="text-xl font-black">Live Alerts</h2>
          <p className="text-sm text-gray-500">
            Hospital operational notifications
          </p>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
            socketConnected
              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {socketConnected ? (
            <>
              <CheckCircle2 size={14} />
              LIVE
            </>
          ) : (
            <>
              <AlertTriangle size={14} />
              OFFLINE
            </>
          )}
        </div>
      </div>

      {/* ALERT LIST */}
      <div className="max-h-[550px] overflow-y-auto">

        {safeAlerts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <CheckCircle2 size={42} className="mx-auto mb-3 text-green-500" />
            No active alerts
          </div>
        ) : (
          safeAlerts.map((alert) => (
            <div
              key={alert.id || `${alert.type}-${alert.time}`}
              className={`border-l-4 p-4 border-b dark:border-gray-800 transition hover:bg-gray-50 dark:hover:bg-gray-800 ${PRIORITY_STYLES[alert.priority] || PRIORITY_STYLES.low}`}
            >
              <div className="flex gap-4">

                {/* ICON */}
                <div className="mt-1">
                  {ICONS[alert.type] || (
                    <AlertTriangle size={20} className="text-gray-500" />
                  )}
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-bold text-sm sm:text-base">
                      {alert.title}
                    </h3>

                    <span
                      className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${
                        PRIORITY_BADGE[alert.priority] || PRIORITY_BADGE.low
                      }`}
                    >
                      {alert.priority}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Clock size={12} />
                    {alert.time}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}