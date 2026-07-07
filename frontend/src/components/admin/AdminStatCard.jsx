export default function AdminStatCard({
  title,
  value,
  accent,
  helper,
  trend,       // 🔥 NEW: +10%, -5%
  icon: Icon,   // 🔥 NEW: optional icon
  urgent = false, // 🔥 NEW: emergency highlight mode
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 shadow-xl border transition-all ${
        urgent
          ? "border-red-500/50 bg-red-50 dark:bg-red-900/10 animate-pulse"
          : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
      }`}
    >
      {/* Accent Bar */}
      <div className={`w-12 h-2 rounded-full ${accent}`} />

      {/* Header Row */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
          {title}
        </p>

        {/* Optional icon */}
        {Icon && (
          <Icon
            className={`w-5 h-5 ${
              urgent ? "text-red-500" : "text-gray-400 dark:text-gray-500"
            }`}
          />
        )}
      </div>

      {/* Main Value */}
      <p
        className={`text-5xl font-black mt-3 tracking-tighter ${
          urgent ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>

      {/* Helper + Trend */}
      <div className="flex items-center justify-between mt-3">
        {helper ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {helper}
          </p>
        ) : (
          <span />
        )}

        {/* Trend Indicator */}
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend.startsWith("-")
                ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}