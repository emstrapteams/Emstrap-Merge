import React from "react";
import { Ambulance, MapPin, Phone, Clock, Navigation, MapPinned } from "lucide-react";

export default function IncomingAmbulances({
  ambulances = [],
  onAccept,
  onReject,
}) {
  if (!ambulances.length) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center text-gray-500">
        No incoming ambulances at the moment
      </div>
    );
  }

  /* ---------------- GOOGLE MAP NAV ---------------- */
  const openGoogleMaps = (amb) => {
    const lat = amb?.location?.lat;
    const lng = amb?.location?.lng;

    if (!lat || !lng) {
      alert("Location not available for this ambulance");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black flex items-center gap-2">
          <Ambulance className="text-red-600" size={20} />
          Incoming Ambulances
        </h2>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
          {ambulances.length}
        </span>
      </div>

      {/* LIST */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">

        {ambulances.map((amb) => (
          <div
            key={amb._id}
            className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition"
          >

            {/* TOP */}
            <div className="flex justify-between items-start gap-3">

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {amb.ambulanceType || "Emergency Ambulance"}
                </h3>

                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Clock size={12} />
                  ETA: {amb.eta || "Calculating..."}
                </p>
              </div>

              <div className="text-xs font-bold text-blue-600">
                {amb.distance ? `${amb.distance} km` : "Nearby"}
              </div>
            </div>

            {/* DETAILS */}
            <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-300">

              <p className="flex items-center gap-2">
                <MapPin size={12} />
                {amb.pickupLocation?.address || "Pickup location not set"}
              </p>

              {amb.patientName && (
                <p className="flex items-center gap-2">
                  <Ambulance size={12} />
                  Patient: {amb.patientName}
                </p>
              )}

              {amb.driverPhone && (
                <p className="flex items-center gap-2">
                  <Phone size={12} />
                  Driver: {amb.driverPhone}
                </p>
              )}

            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4 flex-wrap">

              {/* ACCEPT */}
              <button
                onClick={() => onAccept?.(amb)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg"
              >
                Accept
              </button>

              {/* REJECT */}
              <button
                onClick={() => onReject?.(amb._id)}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold py-2 rounded-lg"
              >
                Reject
              </button>

              {/* GOOGLE MAP NAVIGATION */}
              <button
                onClick={() => openGoogleMaps(amb)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center"
              >
                <Navigation size={14} />
              </button>

              {/* QUICK MAP VIEW (optional fallback) */}
              {amb.locationLink && (
                <a
                  href={amb.locationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
                >
                  <MapPinned size={14} />
                </a>
              )}

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}