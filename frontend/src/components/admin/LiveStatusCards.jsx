import {
  Users,
  Ambulance,
  Building2,
  Shield,
  AlertTriangle,
} from "lucide-react";

/* =========================
   CARD CONFIG
========================= */
const cards = [
  {
    key: "users",
    title: "Registered Users",
    color: "from-indigo-500 to-violet-600",
    icon: Users,
  },
  {
    key: "bookings",
    title: "Ambulance Bookings",
    color: "from-emerald-500 to-green-600",
    icon: Ambulance,
  },
  {
    key: "hospitals",
    title: "Hospitals",
    color: "from-blue-500 to-cyan-600",
    icon: Building2,
  },
  {
    key: "police",
    title: "Police Units",
    color: "from-purple-500 to-violet-600",
    icon: Shield,
  },
  {
    key: "emergencies",
    title: "Active Emergencies",
    color: "from-red-500 to-rose-600",
    icon: AlertTriangle,
  },
];

export default function LiveStatusCards({
  stats = {},
  live = false,        // 🔥 NEW: enable real-time mode
  prevStats = {},      // 🔥 NEW: for spike detection
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
      {cards.map((item) => {
        const Icon = item.icon;

        const value = stats[item.key] || 0;
        const prev = prevStats[item.key] || 0;

        /* =========================
           SPIKE DETECTION
        ========================= */
        const spike = value - prev;

        const isEmergencySpike =
          item.key === "emergencies" && spike > 0;

        const isWarning =
          item.key === "bookings" && spike > 5;

        return (
          <div
            key={item.key}
            className={`relative overflow-hidden rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 p-5 ${
              isEmergencySpike
                ? "border-red-500 bg-red-50 dark:bg-red-900/10 animate-pulse"
                : isWarning
                ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {item.title}
                </p>

                <h2
                  className={`text-3xl font-bold mt-2 ${
                    isEmergencySpike
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {value.toLocaleString()}
                </h2>

                {/* ================= LIVE STATUS ================= */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      live
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-400"
                    }`}
                  ></span>

                  <span
                    className={`text-xs font-semibold ${
                      live ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {live ? "LIVE" : "STATIC"}
                  </span>

                  {/* 🔥 SPIKE ALERT */}
                  {spike !== 0 && (
                    <span
                      className={`text-xs font-bold ml-2 ${
                        spike > 0
                          ? "text-red-500"
                          : "text-blue-500"
                      }`}
                    >
                      {spike > 0 ? `+${spike}` : spike}
                    </span>
                  )}
                </div>
              </div>

              {/* ================= ICON ================= */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center`}
              >
                <Icon size={28} className="text-white" />
              </div>
            </div>

            {/* ================= EMERGENCY WARNING STRIP ================= */}
            {isEmergencySpike && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}