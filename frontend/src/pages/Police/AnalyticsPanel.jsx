import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

/* ────────────────────────────────
  METRIC CARD COMPONENT
──────────────────────────────── */
function MetricCard({ label, value, color }) {
  return (
    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
      <span className="text-[9px] text-slate-500 block uppercase">
        {label}
      </span>
      <p className={`text-2xl font-black ${color}`}>
        {value}
      </p>
    </div>
  );
}

/* ────────────────────────────────
  MAIN COMPONENT
──────────────────────────────── */
export default function AnalyticsPanel({
  stats,
  threats,
  loading = false,
}) {
  /* fallback-safe stats */
  const safeStats = useMemo(
    () => ({
      dispatchCalls: stats?.dispatchCalls ?? 0,
      highPriority: stats?.highPriority ?? 0,
      openCases: stats?.openCases ?? 0,
      avgResponseTime: stats?.avgResponseTime ?? "0m",
      activeUnits: stats?.activeUnits ?? 0,
      hospitals: stats?.hospitals ?? 0,
      fireAlerts: stats?.fireAlerts ?? 0,
      policeUnits: stats?.policeUnits ?? 0,
    }),
    [stats]
  );

  const safeThreats = useMemo(
    () =>
      threats?.length
        ? threats
        : [
            {
              label: "No Data",
              value: 0,
              percent: 0,
              color: "bg-slate-600",
            },
          ],
    [threats]
  );

  /* loading state */
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="animate-pulse text-slate-400 text-sm">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-lg font-black uppercase flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-500" />
          Operational Metrics Matrix
        </h2>

        <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
          LIVE SYSTEM
        </span>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">

        <MetricCard
          label="Today's Dispatch Calls"
          value={safeStats.dispatchCalls}
          color="text-white"
        />

        <MetricCard
          label="High Priority Targets"
          value={safeStats.highPriority}
          color="text-red-400"
        />

        <MetricCard
          label="Open Cases"
          value={safeStats.openCases}
          color="text-amber-400"
        />

        <MetricCard
          label="Avg Response Time"
          value={safeStats.avgResponseTime}
          color="text-emerald-400"
        />

        <MetricCard
          label="Active Units"
          value={safeStats.activeUnits}
          color="text-blue-400"
        />

        <MetricCard
          label="Hospitals"
          value={safeStats.hospitals}
          color="text-purple-400"
        />

        <MetricCard
          label="Fire Alerts"
          value={safeStats.fireAlerts}
          color="text-orange-400"
        />

        <MetricCard
          label="Police Units"
          value={safeStats.policeUnits}
          color="text-indigo-400"
        />
      </div>

      {/* THREAT DISTRIBUTION */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">

        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          Incident Threat Distribution
        </span>

        <div className="space-y-4">
          {safeThreats.map((t, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.label}</span>
                <span>{t.value} Cases</span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-2 ${t.color}`}
                  style={{ width: `${t.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}