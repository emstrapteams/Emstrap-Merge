import { Loader2, Inbox } from "lucide-react";

/* =========================
   LOADING ROW (UPGRADED)
========================= */
export function AdminLoadingRow({
  colSpan = 1,
  label = "Loading data...",
  live = false,        // 🔥 NEW: live update mode
  urgent = false,      // 🔥 NEW: emergency mode
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center">
        <div
          className="flex flex-col items-center justify-center gap-3"
          role="status"
          aria-live="polite"
        >
          <Loader2
            className={`h-7 w-7 animate-spin ${
              urgent ? "text-red-500" : "text-red-500"
            }`}
          />

          <p
            className={`text-sm font-medium ${
              urgent
                ? "text-red-600 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {label}
          </p>

          {/* 🔥 LIVE UPDATE INDICATOR */}
          {live && (
            <span className="text-xs text-blue-500 font-semibold animate-pulse">
              Syncing live data...
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

/* =========================
   EMPTY ROW (UPGRADED)
========================= */
export function AdminEmptyRow({
  colSpan = 1,
  label = "No records found.",
  live = false,       // 🔥 NEW
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          
          <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <Inbox className="h-8 w-8 text-gray-400" />
          </div>

          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-200">
              Nothing to display
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {label}
            </p>

            {/* 🔥 LIVE STATE MESSAGE */}
            {live && (
              <p className="mt-2 text-xs text-blue-500 animate-pulse">
                Waiting for real-time updates...
              </p>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}