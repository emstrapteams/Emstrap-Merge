import React from "react";
import {
  Activity,
  Ambulance,
  Bed,
  HeartPulse,
  TrendingUp,
  Users,
} from "lucide-react";

export default function HospitalCharts({
  stats = {
    emergency: 18,
    admitted: 46,
    discharged: 31,
    ambulances: 8,
    occupancy: 72,
    icu: 9,
  },
}) {
  const occupancyHeight = Math.min(stats.occupancy, 100);

  const weeklyData = [
    { day: "Mon", value: 40 },
    { day: "Tue", value: 62 },
    { day: "Wed", value: 55 },
    { day: "Thu", value: 78 },
    { day: "Fri", value: 85 },
    { day: "Sat", value: 70 },
    { day: "Sun", value: 58 },
  ];

  const total = weeklyData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="grid xl:grid-cols-3 gap-6">

      {/* ================= WEEKLY EMERGENCY ================= */}
      <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800 p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black flex items-center gap-2">
              <TrendingUp className="text-red-600" size={20} />
              Weekly Emergency Flow
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Emergency arrivals during the last 7 days
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-black text-red-600">
              {total}
            </p>
            <p className="text-xs text-gray-500">
              Total Cases
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 h-60">

          {weeklyData.map((item) => (
            <div
              key={item.day}
              className="flex-1 flex flex-col items-center"
            >
              <div className="text-xs font-bold mb-2 text-gray-500">
                {item.value}
              </div>

              <div className="w-full flex items-end h-44">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-red-600 via-red-500 to-red-300 hover:scale-105 transition"
                  style={{
                    height: `${item.value}%`,
                  }}
                />
              </div>

              <div className="mt-3 text-xs font-semibold text-gray-500">
                {item.day}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ================= HOSPITAL STATUS ================= */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800 p-6">

        <h2 className="text-lg font-black flex items-center gap-2 mb-6">
          <Activity className="text-blue-600" size={20} />
          Live Hospital Status
        </h2>

        <div className="space-y-5">

          {/* Bed Occupancy */}
          <div>
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>Bed Occupancy</span>
              <span>{stats.occupancy}%</span>
            </div>

            <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${occupancyHeight}%`,
                }}
              />
            </div>
          </div>

          {/* ICU */}
          <div>
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>ICU Usage</span>
              <span>{stats.icu}/20</span>
            </div>

            <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-500"
                style={{
                  width: `${(stats.icu / 20) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-5 space-y-4">

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HeartPulse className="text-red-500" size={18} />
                <span className="text-sm">Emergency Patients</span>
              </div>

              <span className="font-black text-red-600">
                {stats.emergency}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="text-green-600" size={18} />
                <span className="text-sm">Admitted</span>
              </div>

              <span className="font-black text-green-600">
                {stats.admitted}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bed className="text-blue-600" size={18} />
                <span className="text-sm">Discharged</span>
              </div>

              <span className="font-black text-blue-600">
                {stats.discharged}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Ambulance className="text-orange-600" size={18} />
                <span className="text-sm">
                  Active Ambulances
                </span>
              </div>

              <span className="font-black text-orange-600">
                {stats.ambulances}
              </span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}