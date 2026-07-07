import { useMemo } from "react";
import { Shield, History } from "lucide-react";
import toast from "react-hot-toast";

export default function IncidentModal({
  selectedCase,
  setSelectedCase,
  caseNotes,
  setCaseNotes,
}) {
  /* ────────────────────────────────
    GUARD CLAUSE
  ──────────────────────────────── */
  if (!selectedCase) return null;

  /* ────────────────────────────────
    SAFE DERIVED DATA
  ──────────────────────────────── */
  const metrics = useMemo(
    () => selectedCase?.metrics || {},
    [selectedCase]
  );

  const timeline = useMemo(
    () => selectedCase?.timeline || [],
    [selectedCase]
  );

  const officer = useMemo(
    () => selectedCase?.assignedPolice || {},
    [selectedCase]
  );

  const notesValue =
    caseNotes?.[selectedCase?._id] ?? "";

  /* ────────────────────────────────
    HANDLERS
  ──────────────────────────────── */
  const handleClose = () => {
    setSelectedCase?.(null);
  };

  const handleNotesChange = (e) => {
    const value = e.target.value;

    setCaseNotes?.((prev) => ({
      ...prev,
      [selectedCase._id]: value,
    }));
  };

  const handleSaveNotes = () => {
    toast.success("Notes saved successfully");
  };

  /* ────────────────────────────────
    UI
  ──────────────────────────────── */
  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">

      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* ───────── HEADER ───────── */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <div className="p-2.5 bg-red-600 rounded-xl">
              <Shield className="w-5 h-5 text-black" />
            </div>

            <div className="min-w-0">
              <h2 className="text-white font-black">
                Incident Audit Dossier
              </h2>

              <p className="text-xs text-slate-500 font-mono truncate">
                {selectedCase?._id}
              </p>
            </div>

          </div>

          <button
            onClick={handleClose}
            className="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
          >
            ✕ Close
          </button>

        </div>

        {/* ───────── BODY ───────── */}
        <div className="grid lg:grid-cols-3 gap-6 p-6 overflow-y-auto">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* METRICS */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">

              <h3 className="text-xs font-bold mb-4 text-slate-300">
                Response Metrics
              </h3>

              <div className="grid grid-cols-3 gap-3">

                <Metric label="Dispatch" value={metrics.dispatch} />
                <Metric label="Travel" value={metrics.travel} />
                <Metric label="Arrival" value={metrics.arrival} highlight />

              </div>

            </div>

            {/* TIMELINE */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">

              <h3 className="flex items-center gap-2 font-bold mb-4">
                <History className="w-4 h-4 text-red-500" />
                Timeline
              </h3>

              <div className="space-y-3">

                {timeline.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No timeline events recorded
                  </p>
                ) : (
                  timeline.map((item, index) => (
                    <div key={index} className="flex gap-4 text-sm">

                      <span className="text-slate-500 text-xs w-20 shrink-0">
                        {item?.time || "--"}
                      </span>

                      <span className="text-slate-300">
                        {item?.label || "Event"}
                      </span>

                    </div>
                  ))
                )}

              </div>

            </div>

            {/* MINI MAP */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl h-56 flex items-center justify-center">

              <div className="text-center text-slate-400 text-sm">
                🗺 Mini Map Placeholder
                <br />
                Google Maps / Leaflet integration ready
              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* OFFICER */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">

              <h3 className="font-bold mb-3">
                Assigned Officer
              </h3>

              <OfficerRow label="Name" value={officer.officerName} />
              <OfficerRow label="Badge" value={officer.badge} />
              <OfficerRow label="Vehicle" value={officer.vehicle} />
              <OfficerRow label="Radio" value={officer.radioCode} blue />

            </div>

            {/* NOTES */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">

              <h3 className="font-bold mb-3">
                Case Notes
              </h3>

              <textarea
                value={notesValue}
                onChange={handleNotesChange}
                className="w-full h-36 bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-red-500"
              />

              <button
                onClick={handleSaveNotes}
                className="w-full mt-3 bg-red-600 hover:bg-red-700 transition py-2 rounded-lg font-bold"
              >
                Save Notes
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

/* ────────────────────────────────
  SMALL REUSABLE UI COMPONENTS
──────────────────────────────── */
function Metric({ label, value, highlight }) {
  return (
    <div className="bg-slate-900 p-3 rounded-lg text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`font-bold ${highlight ? "text-green-400" : ""}`}>
        {value ?? "--"}
      </p>
    </div>
  );
}

function OfficerRow({ label, value, blue }) {
  return (
    <p className={`text-sm ${blue ? "text-blue-400" : "text-slate-400"}`}>
      {label} : {value || "N/A"}
    </p>
  );
}