import { useMemo } from "react";
import {
  Eye,
  MapPin,
  AlertCircle,
  Download,
} from "lucide-react";

/* ────────────────────────────────
  SEVERITY CONFIG
──────────────────────────────── */
const SEVERITY_THEME = {
  CRITICAL: {
    label: "🚨 CRITICAL",
    bg: "bg-red-500/10 border-red-500/40 text-red-400 font-black tracking-widest animate-pulse",
  },
  HIGH: {
    label: "🟠 HIGH",
    bg: "bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold",
  },
  MEDIUM: {
    label: "🟡 MEDIUM",
    bg: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-bold",
  },
  LOW: {
    label: "🟢 LOW",
    bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold",
  },
};

/* ────────────────────────────────
  STATUS CONFIG
──────────────────────────────── */
const STATUS_CONFIG = {
  PENDING: {
    label: "🟡 Pending",
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  },
  AMBULANCE_ASSIGNED: {
    label: "🔵 Ambulance Assigned",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  REACHED_PATIENT: {
    label: "🟢 Reached Patient",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  COMPLETED: {
    label: "✅ Completed",
    color: "text-slate-400 bg-slate-800 border-slate-700",
  },
};

/* ────────────────────────────────
  TAG ICONS
──────────────────────────────── */
const TAG_ICONS = {
  FIRE: AlertCircle,
  ACCIDENT: AlertCircle,
  COLLISION: AlertCircle,
  CARDIAC: AlertCircle,
  CRIME: AlertCircle,
  HAZMAT: AlertCircle,
};

/* ────────────────────────────────
  COMPONENT
──────────────────────────────── */
export default function IncidentCard({
  incident,
  formatDuration,
  formatCountdown,
  triggerSimulatedDownload,
  setSelectedCase,
  playAlertSound,
  toast,
}) {
  /* ────────────────────────────────
    SAFE DERIVED VALUES
  ──────────────────────────────── */
  const severity = useMemo(() => {
    return (
      SEVERITY_THEME[incident?.severity] || {
        label: incident?.severity || "UNKNOWN",
        bg: "bg-slate-800 text-slate-300",
      }
    );
  }, [incident]);

  const status = useMemo(() => {
    return (
      STATUS_CONFIG[incident?.status] || {
        label: incident?.status || "UNKNOWN",
        color: "text-slate-300 bg-slate-800",
      }
    );
  }, [incident]);

  const isCritical = incident?.severity === "CRITICAL";

  /* ────────────────────────────────
    SAFE HANDLERS
  ──────────────────────────────── */
  const handleBackup = () => {
    playAlertSound?.("critical");
    toast?.error?.(`Backup requested for ${incident?._id}`);
  };

  const handleDetails = () => {
    setSelectedCase?.(incident);
  };

  const handleDownload = () => {
    triggerSimulatedDownload?.(incident);
  };

  /* ────────────────────────────────
    UI
  ──────────────────────────────── */
  return (
    <div
      className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all duration-200 ${
        isCritical
          ? "border-red-500/40 animate-pulse"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >

      {/* ───────── HEADER ───────── */}
      <div className="space-y-4">

        <div className="flex justify-between">
          <div className="min-w-0">
            <span className="text-[9px] font-mono text-slate-500">
              #{incident?._id}
            </span>

            <h3 className="text-white font-black truncate">
              {incident?.emergencyType || "Unknown Incident"}
            </h3>

            <p className="flex items-center gap-1 text-xs text-slate-400 truncate">
              <MapPin className="w-3 h-3" />
              {incident?.locationName || "Unknown Location"}
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className={`px-2 py-1 rounded border text-[9px] ${severity.bg}`}>
              {severity.label}
            </span>

            <div className={`px-2 py-1 rounded border text-[9px] ${status.color}`}>
              {status.label}
            </div>
          </div>
        </div>

        {/* ───────── TIMERS ───────── */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">

          <div>
            <p className="text-[10px] text-slate-500">Elapsed</p>
            <p className="font-black text-white">
              {formatDuration?.(incident?.elapsedSeconds ?? 0)}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-slate-500">Countdown</p>
            <p className="font-black text-amber-400">
              {formatCountdown?.(incident?.countdownSeconds ?? 0)}
            </p>
          </div>

        </div>

        {/* ───────── TAGS ───────── */}
        <div className="flex flex-wrap gap-2">
          {incident?.tags?.map((tag) => {
            const Icon = TAG_ICONS[tag] || AlertCircle;

            return (
              <span
                key={tag}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border text-slate-300 bg-slate-800 border-slate-700"
              >
                <Icon className="w-3 h-3" />
                {tag}
              </span>
            );
          })}
        </div>

        {/* ───────── OFFICER INFO ───────── */}
        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs space-y-1">

          <p className="font-bold text-white">
            👮 {incident?.assignedPolice?.officerName || "Unassigned"}
          </p>

          <p className="text-slate-400">
            🚓 {incident?.assignedPolice?.vehicle || "N/A"}
          </p>

          <p className="text-blue-400">
            📻 {incident?.assignedPolice?.radioCode || "N/A"}
          </p>

        </div>

      </div>

      {/* ───────── FOOTER ───────── */}
      <div className="flex justify-between mt-5 pt-4 border-t border-slate-800">

        <button
          onClick={handleDownload}
          className="p-2 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-600 transition"
        >
          <Download className="w-4 h-4" />
        </button>

        <div className="flex gap-2">

          <button
            onClick={handleBackup}
            className="px-3 py-2 bg-red-900/40 text-red-300 rounded-lg text-xs font-bold hover:bg-red-900/60 transition"
          >
            CALL BACKUP
          </button>

          <button
            onClick={handleDetails}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs flex items-center gap-1 hover:border-slate-500 transition"
          >
            <Eye className="w-3 h-3" />
            Details
          </button>

        </div>

      </div>
    </div>
  );
}