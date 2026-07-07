import {
  useState,
  useEffect,
  useRef
} from "react";

import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  DirectionsRenderer,
  InfoWindowF
} from "@react-google-maps/api";

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 17.385044, lng: 78.486671 };
const LIBRARIES = ["geometry", "places"];

/* ---------- SAFE COORD EXTRACTOR ---------- */
const extractCoords = (obj) => {
  if (!obj) return null;

  if (obj.location?.coordinates) {
    const [lng, lat] = obj.location.coordinates;
    if (lat != null && lng != null) {
      return { lat: Number(lat), lng: Number(lng) };
    }
  }

  if (obj.lat != null && obj.lng != null) {
    return { lat: Number(obj.lat), lng: Number(obj.lng) };
  }

  if (obj.latitude != null && obj.longitude != null) {
    return { lat: Number(obj.latitude), lng: Number(obj.longitude) };
  }

  return null;
};

const getSeverityColor = (severity) => {
  switch ((severity || "").toLowerCase()) {
    case "critical": return "#ef4444";
    case "high": return "#f97316";
    case "medium": return "#eab308";
    case "low": return "#3b82f6";
    default: return "#ef4444";
  }
};

export default function PoliceLiveMap({
  incidents = [],
  selectedCase = null,
  ambulanceLocations = {},
  policeLocations = {},
  isSocketConnected = true
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES
  });

  const mapRef = useRef(null);

  const [ambDirections, setAmbDirections] = useState(null);
  const [polDirections, setPolDirections] = useState(null);

  const [activeWindow, setActiveWindow] = useState(null);

  const [ambMeta, setAmbMeta] = useState({ duration: "--", distance: "--" });
  const [polMeta, setPolMeta] = useState({ duration: "--", distance: "--" });

  const [smoothAmb, setSmoothAmb] = useState({});
  const [smoothPol, setSmoothPol] = useState({});

  /* ---------- SMOOTH MOVEMENT ---------- */
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      setSmoothAmb(prev => {
        const next = { ...prev };

        Object.keys(ambulanceLocations).forEach(id => {
          const target = extractCoords(ambulanceLocations[id]);
          if (!target) return;

          const cur = prev[id] || target;

          next[id] = {
            lat: cur.lat + (target.lat - cur.lat) * 0.08,
            lng: cur.lng + (target.lng - cur.lng) * 0.08
          };
        });

        return next;
      });

      setSmoothPol(prev => {
        const next = { ...prev };

        Object.keys(policeLocations).forEach(id => {
          const target = extractCoords(policeLocations[id]);
          if (!target) return;

          const cur = prev[id] || target;

          next[id] = {
            lat: cur.lat + (target.lat - cur.lat) * 0.08,
            lng: cur.lng + (target.lng - cur.lng) * 0.08
          };
        });

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [ambulanceLocations, policeLocations, isLoaded]);

  /* ---------- ROUTES ---------- */
  useEffect(() => {
    if (!isLoaded || !selectedCase) return;

    const patient = extractCoords(selectedCase);
    if (!patient) return;

    const id = selectedCase._id;

    const amb = extractCoords(ambulanceLocations[id]) || patient;
    const pol = extractCoords(policeLocations[id]) || patient;

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: amb,
        destination: patient,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (res, status) => {
        if (status === "OK" && res) {
          setAmbDirections(res);
          const leg = res.routes[0].legs[0];
          setAmbMeta({
            duration: leg.duration?.text || "--",
            distance: leg.distance?.text || "--"
          });
        }
      }
    );

    service.route(
      {
        origin: pol,
        destination: patient,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (res, status) => {
        if (status === "OK" && res) {
          setPolDirections(res);
          const leg = res.routes[0].legs[0];
          setPolMeta({
            duration: leg.duration?.text || "--",
            distance: leg.distance?.text || "--"
          });
        }
      }
    );
  }, [selectedCase, ambulanceLocations, policeLocations, isLoaded]);

  /* ---------- RENDER ---------- */
  if (loadError) return <div className="p-4 text-red-500">MAP ERROR</div>;
  if (!isLoaded) return <div className="p-4 text-gray-500">LOADING MAP...</div>;

  return (
    <div className="w-full h-full relative">

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={DEFAULT_CENTER}
        zoom={12}
        onLoad={(map) => (mapRef.current = map)}
      >

        {/* AMB ROUTE */}
        {ambDirections && (
          <DirectionsRenderer
            directions={ambDirections}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#ef4444",
                strokeWeight: 5
              }
            }}
          />
        )}

        {/* POL ROUTE */}
        {polDirections && (
          <DirectionsRenderer
            directions={polDirections}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#3b82f6",
                strokeWeight: 4
              }
            }}
          />
        )}

        {/* MARKERS */}
        {incidents.map((inc) => {
          const id = inc._id;

          const patient = extractCoords(inc);
          const amb = smoothAmb[id];
          const pol = smoothPol[id];

          if (!patient) return null;

          return (
            <div key={id}>

              {/* Patient */}
              <MarkerF
                position={patient}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: getSeverityColor(inc.severity),
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 2
                }}
                onClick={() =>
                  setActiveWindow({
                    type: "incident",
                    data: inc,
                    pos: patient
                  })
                }
              />

              {/* Ambulance */}
              {amb && (
                <MarkerF
                  position={amb}
                  icon={{
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 4,
                    fillColor: "#ef4444",
                    fillOpacity: 1
                  }}
                />
              )}

              {/* Police */}
              {pol && (
                <MarkerF
                  position={pol}
                  icon={{
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 4,
                    fillColor: "#3b82f6",
                    fillOpacity: 1
                  }}
                />
              )}

            </div>
          );
        })}

        {/* INFO WINDOW */}
        {activeWindow && (
          <InfoWindowF
            position={activeWindow.pos}
            onCloseClick={() => setActiveWindow(null)}
          >
            <div className="text-xs p-2">
              <div className="font-bold">CASE</div>
              <div>{activeWindow.data._id}</div>
            </div>
          </InfoWindowF>
        )}

      </GoogleMap>

      {/* HUD */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-3 text-xs rounded">
        AMB ETA: {ambMeta.duration} <br />
        POL ETA: {polMeta.duration}
      </div>

      <div className="absolute top-4 right-4 bg-black/80 text-white p-3 text-xs rounded">
        {isSocketConnected ? "LIVE GPS" : "DISCONNECTED"}
      </div>

    </div>
  );
}