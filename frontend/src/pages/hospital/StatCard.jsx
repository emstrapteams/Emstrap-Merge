import React from "react";
import {
  Activity,
  Bed,
  Ambulance,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  HeartPulse,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const icons = {
  activity: Activity,
  beds: Bed,
  ambulance: Ambulance,
  patients: Users,
  emergency: AlertTriangle,
  completed: CheckCircle,
  waiting: Clock,
  icu: HeartPulse,
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon = "activity",
  color = "blue",
  trend,
  progress,
  live = false,
  critical = false,
  onClick,
}) {
  const Icon = icons[icon] || Activity;

  const colors = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      icon: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900",
      progress: "bg-blue-600",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      icon: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-900",
      progress: "bg-green-600",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      icon: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-900",
      progress: "bg-red-600",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      icon: "text-yellow-600 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-900",
      progress: "bg-yellow-500",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      icon: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-900",
      progress: "bg-purple-600",
    },
  };

  const theme = colors[color] || colors.blue;

  const positive = trend?.startsWith("+");
  const negative = trend?.startsWith("-");

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border ${theme.border}
      bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-xl
      hover:-translate-y-1 transition-all duration-300 cursor-pointer
      ${critical ? "ring-2 ring-red-500 animate-pulse" : ""}`}
    >
      {/* glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-widest font-bold text-gray-500">
              {title}
            </p>

            {live && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </span>
            )}
          </div>

          <h2 className="text-4xl font-black mt-2 text-gray-900 dark:text-white">
            {value ?? 0}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${theme.bg}`}>
          <Icon className={theme.icon} size={28} />
        </div>
      </div>

      {/* progress */}
      {typeof progress === "number" && (
        <div className="mt-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Capacity</span>
            <span>{progress}%</span>
          </div>

          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${theme.progress}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* trend */}
      {trend && (
        <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="text-xs text-gray-500">Today's Trend</span>

          <div
            className={`flex items-center gap-1 text-sm font-bold ${
              positive
                ? "text-green-600"
                : negative
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {positive && <TrendingUp size={15} />}
            {negative && <TrendingDown size={15} />}
            {trend}
          </div>
        </div>
      )}
    </div>
  );
}