import { Outlet } from "react-router-dom";
import { Home, Navigation } from "lucide-react";

export default function HospitalLayout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">

      {/* OPTIONAL TOP BAR (GLOBAL HOSPITAL LAYOUT HEADER) */}
      <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">

        {/* LEFT BRAND */}
        <div className="flex items-center gap-2 font-black text-lg text-gray-800 dark:text-white">
          <Home size={18} />
          EMSTRAP Hospital
        </div>

        {/* RIGHT QUICK ACTIONS */}
        <div className="flex items-center gap-2">

          {/* LIVE STATUS DOT */}
          <span className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            LIVE
          </span>

          {/* NAVIGATION GLOBAL BUTTON (optional future hook) */}
          <button
            onClick={() =>
              window.open(
                "https://www.google.com/maps",
                "_blank"
              )
            }
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            <Navigation size={16} />
            Map
          </button>

        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <div className="p-4">
        <Outlet />
      </div>

    </div>
  );
}