import { useMemo } from "react";
import { Bell } from "lucide-react";

/* ────────────────────────────────
  NOTIFICATION TYPE CONFIG
──────────────────────────────── */
const TYPE_CONFIG = {
  CRITICAL: {
    badge:
      "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse",
  },
  UPDATE: {
    badge:
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  WARNING: {
    badge:
      "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  },
  INFO: {
    badge:
      "bg-blue-500/10 border-blue-500/30 text-blue-400",
  },
};

export default function NotificationSidebar({
  liveNotifications = [],
}) {
  /* ────────────────────────────────
    SAFE DATA NORMALIZATION
  ──────────────────────────────── */
  const notifications = useMemo(() => {
    return Array.isArray(liveNotifications)
      ? liveNotifications
      : [];
  }, [liveNotifications]);

  /* ────────────────────────────────
    EMPTY STATE
  ──────────────────────────────── */
  if (!notifications.length) {
    return (
      <div className="w-full xl:w-[380px] bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shrink-0 shadow-2xl backdrop-blur-md">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">

          <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            Command Stream SIEM Logs
          </h2>

          <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-slate-950 border border-slate-800 text-emerald-400 font-black animate-pulse">
            TELEMETRY SECURE
          </span>

        </div>

        <div className="text-center py-10 text-slate-500 font-mono text-sm">
          No notifications available.
        </div>

      </div>
    );
  }

  /* ────────────────────────────────
    MAIN UI
  ──────────────────────────────── */
  return (
    <div className="w-full xl:w-[380px] bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shrink-0 shadow-2xl backdrop-blur-md">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">

        <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
          <Bell className="w-4 h-4 text-red-500" />
          Command Stream SIEM Logs
        </h2>

        <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-slate-950 border border-slate-800 text-emerald-400 font-black animate-pulse">
          TELEMETRY SECURE
        </span>

      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">

        {notifications.map((n) => {
          const config =
            TYPE_CONFIG[n?.type] || TYPE_CONFIG.INFO;

          return (
            <div
              key={n?.id || `${n?.time}-${n?.message}`}
              className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
            >

              {/* HEADER ROW */}
              <div className="flex justify-between items-center mb-2">

                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${config.badge}`}
                >
                  {n?.type || "INFO"}
                </span>

                <span className="text-[10px] text-slate-500 font-mono">
                  {n?.time || "--:--"}
                </span>

              </div>

              {/* MESSAGE */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {n?.message || "No message content"}
              </p>

            </div>
          );
        })}

      </div>

    </div>
  );
}