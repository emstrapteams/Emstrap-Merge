import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useState, useRef } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "16px",
};

const defaultCenter = {
  lat: 17.385044,
  lng: 78.486671,
};

export default function LiveMap({
  pickup,
  ambulance,
  hospital,
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
  });

  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);

  // Calculate route whenever ambulance or pickup changes
  useEffect(() => {
    if (!isLoaded || !window.google) return;
    if (!pickup || !ambulance) return;

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: ambulance,
        destination: pickup,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        }
      }
    );
  }, [pickup, ambulance, isLoaded]);

  // Auto center map on ambulance movement
  useEffect(() => {
    if (mapRef.current && ambulance) {
      mapRef.current.panTo(ambulance);
    }
  }, [ambulance]);

  if (!isLoaded) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-2xl">
        Loading Map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={ambulance || pickup || defaultCenter}
      zoom={14}
      onLoad={(map) => (mapRef.current = map)}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
      }}
    >
      {/* USER PICKUP MARKER */}
      {pickup && (
        <MarkerF
          position={pickup}
          label="You"
        />
      )}

      {/* AMBULANCE MARKER */}
      {ambulance && (
        <MarkerF
          position={ambulance}
          icon={{
            url: "https://cdn-icons-png.flaticon.com/512/296/296216.png",
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />
      )}

      {/* HOSPITAL MARKER */}
      {hospital && (
        <MarkerF
          position={hospital}
          label="Hospital"
        />
      )}

      {/* ROUTE */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
        />
      )}
    </GoogleMap>
  );
}