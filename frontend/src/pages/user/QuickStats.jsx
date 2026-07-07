import { Activity, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function QuickStats({
  stats = {
    total: 0,
    completed: 0,
    emergency: 0,
    cancelled: 0,
  },
}) {
  const ITEMS = [
    {
      title: "Total Bookings",
      value: stats.total,
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Emergency",
      value: stats.emergency,
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "text-yellow-500",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
      <h2 className="text-lg font-bold mb-4">Quick Stats</h2>

      <div className="grid grid-cols-2 gap-4">
        {ITEMS.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className={`p-4 rounded-xl flex items-center gap-3 ${item.bg}`}
            >
              <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
                <Icon className={item.color} size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">{item.title}</p>
                <p className="text-lg font-bold">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}