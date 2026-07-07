import React from "react";

const GoogleMapButton = ({ origin, destination }) => {
  if (!origin || !destination) return null;

  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
    >
      🗺 Open in Google Maps
    </a>
  );
};

export default GoogleMapButton;