import {
  Wifi,
  Clock3,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Server,
  Timer,
  Database,
} from "lucide-react";

export default function StatusCards({
  systemClock = new Date(),
  latency = 0,
  incidents = [],
  socketConnected = true,
  lastSyncTime,
}) {
  const safeClock = systemClock
    ? systemClock.toLocaleTimeString()
    : "--:--:--";

  const safeSync = lastSyncTime
    ? lastSyncTime.toLocaleTimeString()
    : "--:--:--";

  const criticalCount = incidents.filter(
    (i) => i.severity === "CRITICAL"
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">

      {/* SYSTEM CLOCK */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-red-500/40 transition">
        <div className="flex items-center gap-2 mb-2">
          <Clock3 className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] uppercase font-bold text-slate-500">
            System Clock
          </span>
        </div>

        <h2 className="text-lg font-black tracking-wider text-white">
          {safeClock}
        </h2>
      </div>

      {/* SERVER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-emerald-500/40 transition">
        <div className="flex items-center gap-2 mb-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Server
          </span>
        </div>

        <div
          className={`flex items-center gap-2 font-black ${
            socketConnected
              ? "text-emerald-400"
              : "text-red-500 animate-pulse"
          }`}
        >
          <Wifi className="w-4 h-4" />
          {socketConnected ? "ONLINE" : "OFFLINE"}
        </div>
      </div>

      {/* LATENCY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-blue-500/40 transition">
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Network
          </span>
        </div>

        <h2 className="text-xl font-black text-blue-400">
          {latency} ms
        </h2>
      </div>

      {/* INCIDENTS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-amber-500/40 transition">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Active Incidents
          </span>
        </div>

        <h2 className="text-2xl font-black text-amber-400">
          {incidents.length}
        </h2>
      </div>

      {/* CRITICAL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-red-500/40 transition">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Critical
          </span>
        </div>

        <h2 className="text-2xl font-black text-red-500 animate-pulse">
          {criticalCount}
        </h2>
      </div>

      {/* LAST SYNC */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-purple-500/40 transition">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Last Sync
          </span>
        </div>

        <h2 className="text-sm font-black text-purple-400">
          {safeSync}
        </h2>
      </div>

    </div>
  );
}