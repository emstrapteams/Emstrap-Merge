import { useMemo } from "react";
import {
  Shield,
  Wifi,
  Menu,
  Activity,
  Clock3,
 Server,
  Gauge,
  RefreshCw,
} from "lucide-react";

export default function PoliceHeader({
  systemClock,
  latency = 0,
  incidents = [],
  lastSyncTime,
  socketConnected = false,
  sidebarOpen = true,
  onToggleSidebar,
}) {
  const safeTime = useMemo(
    () => (systemClock ? systemClock.toLocaleTimeString() : "--:--:--"),
    [systemClock]
  );

  const safeSync = useMemo(
    () =>
      lastSyncTime
        ? lastSyncTime.toLocaleTimeString()
        : "--:--:--",
    [lastSyncTime]
  );

  const incidentCount = useMemo(
    () => (Array.isArray(incidents) ? incidents.length : 0),
    [incidents]
  );

  const criticalCount = useMemo(
    () =>
      incidents.filter((i) => i.severity === "CRITICAL").length,
    [incidents]
  );

  return (
    <div className="space-y-3">

      {/* ===================== HEADER ===================== */}

      <header className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-blue-500/5 pointer-events-none" />

        <div className="relative flex flex-col xl:flex-row justify-between gap-5 p-5">

          {/* LEFT */}
          <div className="flex items-center gap-4">

            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 transition"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            <div className="p-3 rounded-2xl bg-red-600 shadow-lg shadow-red-600/30 animate-pulse">
              <Shield className="w-7 h-7 text-black" />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-black tracking-tight text-white">
                  🚨 EMSTRAP POLICE COMMAND CENTER
                </h1>

                <span className="px-2 py-1 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-black tracking-widest animate-pulse">
                  LIVE NODE
                </span>

              </div>

              <p className="text-sm text-slate-400 mt-1">
                Emergency Response • CAD • GIS • Live Vehicle Tracking
              </p>

            </div>

          </div>

          {/* RIGHT METRICS */}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

            {/* CLOCK */}

            <div className="bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 min-w-[120px]">

              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold">
                <Clock3 className="w-3 h-3" />
                Clock
              </div>

              <div className="text-white font-black text-sm mt-1">
                {safeTime}
              </div>

            </div>

            {/* STATUS */}

            <div className="bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 min-w-[120px]">

              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold">
                <Server className="w-3 h-3" />
                Server
              </div>

              <div
                className={`flex items-center gap-1 font-bold mt-1 ${
                  socketConnected
                    ? "text-emerald-400"
                    : "text-red-400 animate-pulse"
                }`}
              >
                <Wifi className="w-4 h-4" />
                {socketConnected ? "ONLINE" : "OFFLINE"}
              </div>

            </div>

            {/* LATENCY */}

            <div className="bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 min-w-[120px]">

              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold">
                <Gauge className="w-3 h-3" />
                Latency
              </div>

              <div className="text-blue-400 font-black text-lg mt-1">
                {latency} ms
              </div>

            </div>

            {/* INCIDENTS */}

            <div className="bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 min-w-[120px]">

              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold">
                <Activity className="w-3 h-3" />
                Incidents
              </div>

              <div className="text-amber-400 font-black text-lg mt-1">
                {incidentCount}
              </div>

            </div>

            {/* CRITICAL */}

            <div className="bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 min-w-[120px]">

              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold">
                🚨 Critical
              </div>

              <div className="text-red-500 font-black text-lg mt-1 animate-pulse">
                {criticalCount}
              </div>

            </div>

          </div>

        </div>

      </header>

      {/* ===================== SHORTCUT BAR ===================== */}

      <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 flex flex-wrap justify-between items-center gap-3 text-xs font-mono">

        <div className="flex flex-wrap gap-5 text-slate-400">

          <span>
            <kbd className="px-2 py-1 bg-slate-950 rounded border border-slate-700">
              F1
            </kbd>{" "}
            Dispatch
          </span>

          <span>
            <kbd className="px-2 py-1 bg-slate-950 rounded border border-slate-700">
              F2
            </kbd>{" "}
            Refresh
          </span>

          <span>
            <kbd className="px-2 py-1 bg-slate-950 rounded border border-slate-700">
              F3
            </kbd>{" "}
            Search
          </span>

          <span>
            <kbd className="px-2 py-1 bg-slate-950 rounded border border-slate-700">
              ESC
            </kbd>{" "}
            Close
          </span>

          <span>
            <kbd className="px-2 py-1 bg-slate-950 rounded border border-slate-700">
              CTRL+B
            </kbd>{" "}
            Sidebar
          </span>

        </div>

        <div className="flex items-center gap-3">

          <RefreshCw className="w-4 h-4 text-emerald-400" />

          <span className="text-slate-400">
            Last Sync :
          </span>

          <span className="font-bold text-white">
            {safeSync}
          </span>

        </div>

      </div>

    </div>
  );
}