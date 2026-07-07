import {
  GoogleMap,
  MarkerF,
  useJsApiLoader,
  PolylineF,
} from "@react-google-maps/api";
import { useMemo, useState, useEffect } from "react";

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

export default function PoliceLiveMap({ units = [], incidents = [] }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: ["geometry"],
  });

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  /* ────────────────────────────────
    LIVE ROUTE GENERATION (REAL CAD STYLE)
  ──────────────────────────────── */
  useEffect(() => {
    if (!selectedIncident || !units.length) return;

    const origin = `${units[0].lat},${units[0].lng}`;
    const destination = `${selectedIncident.lat},${selectedIncident.lng}`;

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
        );

        const data = await res.json();

        const points =
          data?.routes?.[0]?.overview_polyline?.points;

        if (points) {
          const decoded = window.google.maps.geometry.encoding.decodePath(points);
          setRoutePath(decoded.map((p) => ({ lat: p.lat(), lng: p.lng() })));
        }
      } catch (err) {
        console.log("Route error:", err);
      }
    };

    fetchRoute();
  }, [selectedIncident, units]);

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center text-slate-400">
        Loading CAD Map Engine...
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-800">

      <GoogleMap
        center={units[0] || DEFAULT_CENTER}
        zoom={13}
        mapContainerStyle={{ width: "100%", height: "100%" }}
      >

        {/* POLICE UNITS (LIVE) */}
        {units.map((u) => (
          <MarkerF
            key={u.id}
            position={{ lat: u.lat, lng: u.lng }}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        ))}

        {/* INCIDENT MARKERS */}
        {incidents.map((i) => (
          <MarkerF
            key={i.id}
            position={{ lat: i.lat, lng: i.lng }}
            onClick={() => setSelectedIncident(i)}
            icon={{
              url:
                i.severity === "CRITICAL"
                  ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  : "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
            }}
          />
        ))}

        {/* ROUTE LINE */}
        {routePath.length > 0 && (
          <PolylineF
            path={routePath}
            options={{
              strokeColor: "#ef4444",
              strokeOpacity: 1,
              strokeWeight: 4,
            }}
          />
        )}

      </GoogleMap>

      {/* NAVIGATION PANEL */}
      {selectedIncident && (
        <div className="absolute bottom-4 left-4 bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-xl">

          <p className="text-xs text-white mb-2 font-mono">
            Navigate → {selectedIncident.id}
          </p>

          <button
            className="bg-red-600 px-3 py-2 text-xs rounded-lg font-bold"
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${selectedIncident.lat},${selectedIncident.lng}`,
                "_blank"
              );
            }}
          >
            Open Google Navigation
          </button>
        </div>
      )}

    </div>
  );
}