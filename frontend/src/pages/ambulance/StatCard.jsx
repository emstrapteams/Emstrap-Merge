import { TrendingUp } from "lucide-react";

const COLOR_MAP = {
  red: "bg-red-50 text-red-600 dark:bg-red-950/30",
  green: "bg-green-50 text-green-600 dark:bg-green-950/30",
  yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/30",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/30",
  gray: "bg-gray-50 text-gray-600 dark:bg-gray-800",
};

const ICONS = {
  ambulance: "🚑",
  completed: "✅",
  waiting: "⏳",
  emergency: "🚨",
  default: "📊",
};

export default function StatCard({
  title = "Metric",
  value = 0,
  color = "blue",
  icon = "default",
  subtitle,
}) {
  const theme = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className="p-4 bg-white dark:bg-gray-900 shadow rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">
          <span className="text-xl">{ICONS[icon] || ICONS.default}</span>

          <h2 className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </h2>
        </div>

        {/* small trend icon (future ready) */}
        <TrendingUp size={14} className="text-gray-400" />
      </div>

      {/* VALUE */}
      <div className={`mt-2 text-2xl font-bold ${theme.split(" ")[1]}`}>
        {value}
      </div>

      {/* OPTIONAL SUBTITLE */}
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}