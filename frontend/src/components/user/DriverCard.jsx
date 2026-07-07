import React, { useMemo } from "react";
import { User, Star, Phone, MapPin } from "lucide-react";

export default function DriverCard({ driver, destination }) {
  const safeDriver = useMemo(() => driver || {}, [driver]);

  const {
    name,
    profileImage,
    rating,
    vehicleModel,
    plateNumber,
    phone,
  } = safeDriver;

  if (!driver) {
    return (
      <div className="text-xs text-gray-400 font-medium animate-pulse">
        Waiting for responder assignment...
      </div>
    );
  }

  // 🚑 Google Maps navigation link (Driver → Patient / Hospital)
  const googleMapsUrl = useMemo(() => {
    if (!destination?.lat || !destination?.lng) return null;

    return `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  }, [destination]);

  // Optional: quick map view (not navigation)
  const googleMapViewUrl = useMemo(() => {
    if (!destination?.lat || !destination?.lng) return null;

    return `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`;
  }, [destination]);

  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border dark:border-gray-700 transition-all duration-300">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 min-w-0">

        {/* AVATAR */}
        <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">

          {profileImage ? (
            <img
              src={profileImage}
              alt={name || "Driver"}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={16} className="text-gray-500" />
          )}

          {/* RATING */}
          <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-[9px] font-black px-1 rounded-full flex items-center gap-0.5 shadow">
            <Star size={10} className="fill-white" />
            {rating ?? "5.0"}
          </span>
        </div>

        {/* INFO */}
        <div className="min-w-0">
          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
            {name || "EOC Responder"}
          </div>

          <div className="text-xs text-gray-500 truncate">
            {vehicleModel || "Ambulance"} •{" "}
            <span className="font-mono">
              {plateNumber || "UNASSIGNED"}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-2">

        {/* 📍 MAP VIEW */}
        {googleMapViewUrl && (
          <a
            href={googleMapViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
          >
            <MapPin size={12} />
            Map
          </a>
        )}

        {/* 🧭 NAVIGATION */}
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition"
          >
            Navigate
          </a>
        )}

        {/* 📞 CALL */}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1 bg-white dark:bg-gray-800 border dark:border-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <Phone size={12} className="text-green-500" />
            Call
          </a>
        )}
      </div>
    </div>
  );
}