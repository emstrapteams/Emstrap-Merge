import React, { useMemo } from "react";

export default function GoogleMapButton({
  lat,
  lng,
  label = "Open Navigation",
  mode = "directions", // directions | search
  className = "",
}) {
  const url = useMemo(() => {
    if (!lat || !lng) return null;

    const coords = `${lat},${lng}`;

    // 🧭 directions = real navigation (ambulance use case)
    if (mode === "directions") {
      return `https://www.google.com/maps/dir/?api=1&destination=${coords}&travelmode=driving`;
    }

    // 📍 search = just view location
    return `https://www.google.com/maps/search/?api=1&query=${coords}`;
  }, [lat, lng, mode]);

  const handleOpen = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleOpen}
      disabled={!url}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all duration-200
        ${
          url
            ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            : "bg-gray-400 cursor-not-allowed"
        }
        ${className}`}
    >
      📍 {label}
    </button>
  );
}