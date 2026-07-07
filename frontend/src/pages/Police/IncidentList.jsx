import { useMemo } from "react";
import IncidentCard from "./IncidentCard";

export default function IncidentList({
  incidents,
  formatDuration,
  formatCountdown,
  triggerSimulatedDownload,
  setSelectedCase,
  playAlertSound,
  toast,
}) {
  /* ────────────────────────────────
    SAFE DATA
  ──────────────────────────────── */
  const safeIncidents = useMemo(() => {
    return Array.isArray(incidents) ? incidents : [];
  }, [incidents]);

  /* ────────────────────────────────
    EMPTY STATE
  ──────────────────────────────── */
  if (!safeIncidents.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl font-mono text-center space-y-3">

        <div className="text-4xl text-slate-700 animate-pulse">
          🛰️
        </div>

        <div className="text-slate-400 font-bold tracking-wider">
          No Incident Matrix Matches Found
        </div>

        <p className="text-[11px] text-slate-600 max-w-xs">
          Waiting for incoming emergency incidents...
        </p>

      </div>
    );
  }

  /* ────────────────────────────────
    LIST RENDER (OPTIMIZED)
  ──────────────────────────────── */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {safeIncidents.map((incident) => {
        const id = incident?._id;

        if (!id) return null;

        return (
          <IncidentCard
            key={id}
            incident={incident}
            formatDuration={formatDuration}
            formatCountdown={formatCountdown}
            triggerSimulatedDownload={triggerSimulatedDownload}
            setSelectedCase={setSelectedCase}
            playAlertSound={playAlertSound}
            toast={toast}
          />
        );
      })}

    </div>
  );
}