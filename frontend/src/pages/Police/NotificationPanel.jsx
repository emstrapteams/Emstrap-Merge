import { useMemo } from "react";
import { Bell } from "lucide-react";

/* ────────────────────────────────
  NOTIFICATION TYPE CONFIG
──────────────────────────────── */
const NOTIFICATION_TYPES = {
  CRITICAL: {
    badge:
      "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse",
  },
  UPDATE: {
    badge:
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  INFO: {
    badge:
      "bg-blue-500/10 border-blue-500/30 text-blue-400",
  },
  WARNING: {
    badge:
      "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  },
};

export default function NotificationPanel({ liveNotifications }) {
  /* ────────────────────────────────
    SAFE DATA
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

          <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-red-500" />
            Command Stream SIEM Logs
          </h2>

          <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-slate-950 border border-slate-800 text-emerald-400 font-black animate-pulse">
            TELEMETRY SECURE
          </span>

        </div>

        <div className="text-center text-slate-500 text-sm py-10">
          No Notifications
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

        <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-red-500" />
          Command Stream SIEM Logs
        </h2>

        <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-slate-950 border border-slate-800 text-emerald-400 font-black animate-pulse">
          TELEMETRY SECURE
        </span>

      </div>

      {/* NOTIFICATIONS */}
      <div className="space-y-2.5 max-h-[660px] overflow-y-auto pr-1">

        {notifications.map((n) => {
          const config =
            NOTIFICATION_TYPES[n?.type] ||
            NOTIFICATION_TYPES.INFO;

          return (
            <div
              key={n?.id || n?.time + n?.message}
              className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] hover:border-slate-700 transition-colors"
            >

              {/* HEADER ROW */}
              <div className="flex justify-between items-center mb-1.5">

                <span
                  className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider ${config.badge}`}
                >
                  ● {n?.type || "INFO"}
                </span>

                <span className="text-slate-500 text-[9px]">
                  {n?.time || "--:--"}
                </span>

              </div>

              {/* MESSAGE */}
              <p className="text-slate-300 leading-relaxed">
                {n?.message || "No message content"}
              </p>

            </div>
          );
        })}

      </div>

    </div>
  );
}