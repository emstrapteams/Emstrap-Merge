import React, { useMemo } from "react";

export default function StatCard({
  label,
  value,
  isActive,
  onClick,
  loading,
  trend,        // optional: +5%, -2%, etc
  icon: Icon,    // optional icon support
  color = "blue",
}) {
  const safeValue = useMemo(() => {
    if (loading) return null;
    if (value === undefined || value === null) return 0;
    return value;
  }, [value, loading]);

  const colorClasses = {
    blue: {
      active: "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
      label: "text-blue-600 dark:text-blue-400",
    },
    green: {
      active: "bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
      label: "text-green-600 dark:text-green-400",
    },
    red: {
      active: "bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
      label: "text-red-600 dark:text-red-400",
    },
    gray: {
      active: "bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
      label: "text-gray-500 dark:text-gray-400",
    },
  };

  const theme = colorClasses[color] || colorClasses.blue;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`relative text-left p-5 rounded-2xl border shadow-sm w-full transition-all duration-200 active:scale-[0.97] overflow-hidden ${
        isActive
          ? theme.active
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80"
      }`}
    >

      {/* subtle glow for active (dispatch feel) */}
      {isActive && (
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-blue-400 to-transparent pointer-events-none" />
      )}

      {/* TOP ROW */}
      <div className="flex items-center justify-between relative z-10">

        <div className="flex items-center gap-2">

          {Icon && (
            <Icon
              size={16}
              className={
                isActive ? theme.label : "text-gray-400 dark:text-gray-500"
              }
            />
          )}

          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              isActive ? theme.label : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {label}
          </p>
        </div>

        {/* TREND (optional live indicator) */}
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              trend.startsWith("+")
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {/* VALUE */}
      <div className="relative z-10 mt-2 flex items-end justify-between">

        <p
          className={`text-3xl font-black transition-all duration-200 ${
            isActive ? "scale-105" : ""
          }`}
        >
          {loading ? (
            <span className="animate-pulse text-gray-400">•••</span>
          ) : (
            safeValue
          )}
        </p>

      </div>

    </button>
  );
}