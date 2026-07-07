import { useEffect } from "react";

export default function AdminModal({
  title,
  subtitle,
  onClose,
  children,
  actions,      // 🔥 NEW (optional action buttons)
  isUrgent = false, // 🔥 NEW (emergency highlight mode)
}) {
  /* =========================
     LOCK BACKGROUND SCROLL
  ========================= */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4">
      
      <div
        className={`w-full max-w-3xl overflow-hidden rounded-3xl border shadow-2xl transition-all ${
          isUrgent
            ? "border-red-500 ring-2 ring-red-500/30"
            : "border-white/10 dark:border-gray-700"
        } bg-white dark:bg-gray-800`}
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-gray-700">
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {isUrgent && <span className="text-red-500">🚨</span>}
              {title}
            </h3>

            {subtitle ? (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            
            {/* 🔥 ACTIONS SLOT (dispatch / map / etc) */}
            {actions && <div className="flex gap-2">{actions}</div>}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="max-h-[75vh] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}