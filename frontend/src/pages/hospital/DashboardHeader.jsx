import React, { useMemo } from "react";
import {
  Hospital,
  Clock,
  Wifi,
  Bell,
  RefreshCw,
  Ambulance,
  Activity,
  ShieldCheck,
} from "lucide-react";

export default function DashboardHeader({
  hospitalName = "EMSTRAP Hospital",
  totalAlerts = 0,
  activeEmergencies = 0,
  incomingAmbulances = 0,
  socketConnected = true,
  systemTime,
  lastSync = "Just now",
  onRefresh,
}) {
  const displayTime = useMemo(() => {
    return systemTime || new Date().toLocaleTimeString();
  }, [systemTime]);

  return (
    <header className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">

      <div className="flex flex-col xl:flex-row justify-between gap-6">

        {/* LEFT SECTION */}
        <div className="flex items-start gap-5">

          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
            <Hospital size={32} className="text-red-600" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
              Hospital Command Center
            </h1>

            <p className="text-gray-500 mt-1">{hospitalName}</p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm">

              <div className="flex items-center gap-2">
                <Activity size={16} className="text-red-500" />
                <span className="font-semibold">
                  {activeEmergencies} Active Emergencies
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Ambulance size={16} className="text-blue-500" />
                <span className="font-semibold">
                  {incomingAmbulances} Incoming Ambulances
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-wrap items-center gap-3">

          {/* SYSTEM TIME */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 min-w-[170px]">
            <Clock size={16} />

            <div>
              <p className="text-xs text-gray-500">System Time</p>
              <p className="font-bold text-sm">{displayTime}</p>
            </div>
          </div>

          {/* CONNECTION STATUS */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl min-w-[140px] ${
              socketConnected
                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            <Wifi size={16} />

            <div>
              <p className="text-xs opacity-70">Server</p>
              <p className="font-bold">
                {socketConnected ? "LIVE" : "OFFLINE"}
              </p>
            </div>
          </div>

          {/* LAST SYNC */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 min-w-[150px]">
            <ShieldCheck size={16} className="text-blue-600" />

            <div>
              <p className="text-xs text-gray-500">Last Sync</p>
              <p className="font-semibold text-sm">{lastSync}</p>
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition">
              <Bell size={20} />
            </button>

            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {totalAlerts > 99 ? "99+" : totalAlerts}
              </span>
            )}
          </div>

          {/* REFRESH */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}