import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RecenterMap({ position }) {
  const map = useMap();
  if (position?.lat && position?.lng) {
    map.flyTo([position.lat, position.lng], map.getZoom(), {
      animate: true,
      duration: 1,
    });
  }
  return null;
}

export default function TrackingMap({ userLocation, driverLocation, ambulanceLocation }) {
  // Try to use whatever location is provided
  const targetLocation = driverLocation || ambulanceLocation || userLocation;
  
  const center = targetLocation?.lat 
    ? [targetLocation.lat, targetLocation.lng] 
    : [20.5937, 78.9629];

  const openGoogleMaps = () => {
    if (!targetLocation?.lat || !targetLocation?.lng) return;
    
    // Create a dynamic directions link from User to Driver, or just open location
    if (userLocation?.lat && driverLocation?.lat) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${driverLocation.lat},${driverLocation.lng}&destination=${userLocation.lat},${userLocation.lng}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps?q=${targetLocation.lat},${targetLocation.lng}`,
        "_blank"
      );
    }
  };

  return (
    <div className="w-full h-[400px] relative rounded-xl overflow-hidden shadow">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <RecenterMap position={targetLocation} />

        {userLocation?.lat && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>User Location</Popup>
          </Marker>
        )}

        {(driverLocation?.lat || ambulanceLocation?.lat) && (
          <Marker position={[driverLocation?.lat || ambulanceLocation.lat, driverLocation?.lng || ambulanceLocation.lng]}>
            <Popup>🚑 Ambulance Live</Popup>
          </Marker>
        )}
      </MapContainer>

      <button
        onClick={openGoogleMaps}
        className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg z-[1000] flex items-center gap-2"
      >
        🗺️ Navigate in Google Maps
      </button>
    </div>
  );
}