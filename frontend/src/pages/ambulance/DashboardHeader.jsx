import { RefreshCcw, Wifi, WifiOff, Bell } from "lucide-react";

export default function DashboardHeader({
  hospitalName = "Ambulance Dashboard",
  totalAlerts = 0,
  socketConnected = false,
  systemTime,
  onRefresh,
}) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

      {/* LEFT SECTION */}
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          🚑 {hospitalName}
        </h1>
        <p className="text-xs text-gray-500">
          Live Emergency Control System
        </p>
      </div>

      {/* CENTER STATUS */}
      <div className="flex items-center gap-4 text-sm">

        {/* SOCKET STATUS */}
        <div className="flex items-center gap-1">
          {socketConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className={socketConnected ? "text-green-600" : "text-red-600"}>
            {socketConnected ? "Live" : "Offline"}
          </span>
        </div>

        {/* TIME */}
        <span className="text-gray-600 dark:text-gray-300">
          🕒 {systemTime}
        </span>

        {/* ALERTS */}
        <div className="flex items-center gap-1">
          <Bell className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-orange-600">
            {totalAlerts}
          </span>
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-2">

        <button
          onClick={onRefresh}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>

      </div>
    </div>
  );
}