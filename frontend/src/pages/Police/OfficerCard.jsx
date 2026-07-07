import { useMemo } from "react";

const STATUS_THEME = {
  ACTIVE: "text-emerald-400",
  BUSY: "text-yellow-400",
  OFFLINE: "text-slate-500",
};

export default function OfficerCard({ officer }) {
  if (!officer) return null;

  /* ────────────────────────────────
    SAFE DERIVED STATE
  ──────────────────────────────── */
  const status = useMemo(() => {
    return officer.status || "ACTIVE";
  }, [officer.status]);

  const statusColor = STATUS_THEME[status] || STATUS_THEME.ACTIVE;

  return (
    <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-4 font-mono transition hover:border-slate-700">

      {/* ───────── HEADER ───────── */}
      <div className="border-b border-slate-800 pb-2">

        <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">
          CAD FIELD UNIT REGISTERED
        </span>

        <h4 className="text-sm font-black text-white mt-1">
          👮 {officer?.officerName || "Unknown Officer"}
        </h4>

      </div>

      {/* ───────── DETAILS GRID ───────── */}
      <div className="grid grid-cols-2 gap-3 text-xs">

        <div>
          <span className="text-[9px] text-slate-500 block">BADGE</span>
          <span className="text-slate-300 font-bold">
            {officer?.badge || "--"}
          </span>
        </div>

        <div>
          <span className="text-[9px] text-slate-500 block">VEHICLE</span>
          <span className="text-slate-300 font-bold">
            🚓 {officer?.vehicle || "Unassigned"}
          </span>
        </div>

        <div>
          <span className="text-[9px] text-slate-500 block">RADIO</span>
          <span className="text-blue-400 font-bold">
            📻 {officer?.radioCode || "N/A"}
          </span>
        </div>

        <div>
          <span className="text-[9px] text-slate-500 block">SHIFT</span>
          <span className="text-slate-300">
            {officer?.shift || "Unknown"}
          </span>
        </div>

      </div>

      {/* ───────── EXPERIENCE / STATUS ───────── */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 space-y-2">

        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
          EXPERIENCE
        </span>

        <p className="text-slate-200 font-bold">
          🎖️ {officer?.experience || "Not specified"}
        </p>

        {/* STATUS (NEW UPGRADE) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">

          <span className="text-[10px] text-slate-500 uppercase">
            Status
          </span>

          <span className={`text-xs font-black uppercase ${statusColor}`}>
            ● {status}
          </span>

        </div>

      </div>
    </div>
  );
}