import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl: icon2x,
  shadowUrl: shadow,
});

/* ---------------- GOOGLE MAPS ---------------- */
const openGoogleMaps = (lat, lng) => {
  if (!lat || !lng) return;
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
};

/* ---------------- SMOOTH MAP CENTER CONTROL ---------------- */
function RecenterMap({ position }) {
  const map = useMap();

  // only recenter when valid update comes
  if (position?.lat && position?.lng) {
    map.flyTo([position.lat, position.lng], map.getZoom(), {
      animate: true,
      duration: 1,
    });
  }

  return null;
}

export default function LiveTrackingMap({
  userLocation,
  driverLocation,
}) {
  const center = userLocation?.lat
    ? [userLocation.lat, userLocation.lng]
    : [20.5937, 78.9629];

  return (
    <div className="relative w-full h-[500px]">

      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* AUTO FOLLOW DRIVER (IMPORTANT FIX) */}
        <RecenterMap position={driverLocation || userLocation} />

        {/* USER MARKER */}
        {userLocation?.lat && userLocation?.lng && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>User Location</Popup>
          </Marker>
        )}

        {/* AMBULANCE MARKER */}
        {driverLocation?.lat && driverLocation?.lng && (
          <Marker position={[driverLocation.lat, driverLocation.lng]}>
            <Popup>🚑 Ambulance Live</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* GOOGLE MAP BUTTONS (UNCHANGED LOGIC) */}
      {userLocation?.lat && userLocation?.lng && (
        <button
          onClick={() =>
            openGoogleMaps(userLocation.lat, userLocation.lng)
          }
          className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded"
        >
          Open User in Google Maps
        </button>
      )}

      {driverLocation?.lat && driverLocation?.lng && (
        <button
          onClick={() =>
            openGoogleMaps(driverLocation.lat, driverLocation.lng)
          }
          className="absolute top-16 right-4 bg-blue-600 text-white px-3 py-2 rounded"
        >
          Open Ambulance in Google Maps
        </button>
      )}
    </div>
  );
}