import {
  History,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Ambulance,
  Shield,
  MapPin,
} from "lucide-react";

const ICONS = {
  CREATED: Clock3,
  DISPATCHED: Radio,
  POLICE_ASSIGNED: Shield,
  AMBULANCE_ASSIGNED: Ambulance,
  EN_ROUTE: MapPin,
  ARRIVED: CheckCircle2,
  COMPLETED: CheckCircle2,
  CRITICAL: AlertTriangle,
};

const COLORS = {
  CREATED: "bg-blue-500",
  DISPATCHED: "bg-indigo-500",
  POLICE_ASSIGNED: "bg-cyan-500",
  AMBULANCE_ASSIGNED: "bg-purple-500",
  EN_ROUTE: "bg-amber-500",
  ARRIVED: "bg-emerald-500",
  COMPLETED: "bg-emerald-600",
  CRITICAL: "bg-red-500 animate-pulse",
};

export default function Timeline({ timeline = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-red-500" />
          <h2 className="text-sm font-black uppercase tracking-wider text-white">
            Incident Timeline
          </h2>
        </div>

        <span className="text-[10px] font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">
          {timeline.length} EVENTS
        </span>
      </div>

      {/* Empty */}
      {timeline.length === 0 ? (
        <div className="py-14 flex flex-col items-center text-center">
          <History className="w-10 h-10 text-slate-700 mb-3" />
          <p className="text-slate-400 font-semibold">
            No Incident Timeline
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Waiting for backend events...
          </p>
        </div>
      ) : (
        <div className="relative p-6">

          {/* Vertical Line */}
          <div className="absolute left-[31px] top-8 bottom-8 w-px bg-slate-700" />

          <div className="space-y-6">

            {timeline.map((item, index) => {
              const Icon = ICONS[item.status] || Clock3;
              const dotColor =
                COLORS[item.status] || "bg-slate-500";

              return (
                <div
                  key={index}
                  className="relative flex items-start gap-4"
                >

                  {/* Dot */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full ${dotColor} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">

                    <div className="flex justify-between items-center mb-2">

                      <h3 className="text-sm font-bold text-white">
                        {item.label}
                      </h3>

                      <span className="text-[11px] text-slate-500 font-mono">
                        {item.time}
                      </span>

                    </div>

                    {item.description && (
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      )}

    </div>
  );
}