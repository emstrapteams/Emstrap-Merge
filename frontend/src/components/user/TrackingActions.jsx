import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Navigation,
  Phone,
  FileDown,
  Loader2,
  MapPin,
} from "lucide-react";

export default function TrackingActions({
  booking,
  isOperative,
  isCancelable,
  isLiveTrackingActive,
  onCancel,
  cancelLoading,
  onDownloadReceipt,
}) {
  // 🚀 prevent undefined re-renders
  const b = booking || {};

  const destination = b.destination;

  // 🗺 MAP LINKS (optimized)
  const maps = useMemo(() => {
    if (!destination?.lat || !destination?.lng) return {};

    const coords = `${destination.lat},${destination.lng}`;

    return {
      view: `https://www.google.com/maps/search/?api=1&query=${coords}`,
      nav: `https://www.google.com/maps/dir/?api=1&destination=${coords}&travelmode=driving`,
    };
  }, [destination?.lat, destination?.lng]);

  const isLoadingCancel = !!cancelLoading?.[b._id];

  return (
    <div className="flex flex-wrap gap-2 justify-end items-center w-full lg:w-auto">

      {/* 🗺 MAP VIEW */}
      {maps.view && (
        <a
          href={maps.view}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:scale-[1.02] transition w-full sm:w-auto"
        >
          <MapPin size={13} />
          Map
        </a>
      )}

      {/* 🚑 LIVE TRACK */}
      {isOperative && b.requestId && (
        <Link
          to={b.isEmergency ? "/emergency" : `/tracking/${b.requestId}`}
          className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md transition w-full sm:w-auto ${
            b.isEmergency
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          <Navigation size={13} className="rotate-45" />
          Track Live

          {isLiveTrackingActive && (
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] px-1 py-0.5 rounded animate-pulse">
              LIVE
            </span>
          )}
        </Link>
      )}

      {/* 🧭 NAVIGATE DRIVER */}
      {maps.nav && isOperative && (
        <a
          href={maps.nav}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 transition w-full sm:w-auto"
        >
          Navigate
        </a>
      )}

      {/* 📄 RECEIPT */}
      {b.status === "COMPLETED" && (
        <button
          onClick={() =>
            onDownloadReceipt?.(b) || console.log("Receipt:", b._id)
          }
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full sm:w-auto"
        >
          <FileDown size={14} className="text-blue-500" />
          Receipt
        </button>
      )}

      {/* 📞 CALL */}
      {b.driver?.phone && isOperative && (
        <a
          href={`tel:${b.driver.phone}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full sm:w-auto"
        >
          <Phone size={13} className="text-emerald-500" />
          Call
        </a>
      )}

      {/* ❌ CANCEL */}
      {isCancelable && (
        <button
          onClick={() => onCancel?.(b._id)}
          disabled={isLoadingCancel}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50 transition w-full sm:w-auto"
        >
          {isLoadingCancel ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            "Abort"
          )}
        </button>
      )}
    </div>
  );
}