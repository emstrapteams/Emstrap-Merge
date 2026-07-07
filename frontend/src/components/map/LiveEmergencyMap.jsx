import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { interpolatePosition } from "../../utils/geo";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { interpolatePosition } from "../../utils/geo";

/* ---------------- OSRM ROUTE ---------------- */
async function getRoute(start, end) {
  try {
    if (!start || !end) return [];

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    return (
      data.routes?.[0]?.geometry?.coordinates?.map((c) => ({
        lat: c[1],
        lng: c[0],
      })) || []
    );
  } catch {
    return [];
  }
}

export default function LiveEmergencyMap({
  activeEmergencies = [],
  ambulances = [],
}) {
  const [routes, setRoutes] = useState({});
  const [animatedAmbulances, setAnimatedAmbulances] = useState({});

  /* ---------------- CACHE (VERY IMPORTANT) ---------------- */
  const routeCache = useRef({});
  const lastAmbulanceRef = useRef({});

  /* ---------------- SMART ROUTE UPDATE ---------------- */
  useEffect(() => {
    let active = true;

    const loadRoutes = async () => {
      const updatedRoutes = {};

      for (let e of activeEmergencies) {
        const amb = e?.assignedAmbulance;
        const dest = e?.location;

        if (!amb?.location || !dest) continue;

        const key = e._id;

        // avoid recalculating same route again
        if (routeCache.current[key]) {
          updatedRoutes[key] = routeCache.current[key];
          continue;
        }

        const route = await getRoute(amb.location, dest);

        routeCache.current[key] = route;
        updatedRoutes[key] = route;
      }

      if (active) setRoutes(updatedRoutes);
    };

    loadRoutes();

    return () => {
      active = false;
    };
  }, [activeEmergencies]);

  /* ---------------- SMOOTH MOTION ENGINE ---------------- */
  useEffect(() => {
    let frameId;

    const animate = () => {
      setAnimatedAmbulances((prev) => {
        const next = { ...prev };

        ambulances.forEach((a) => {
          const newPos = a?.location;
          if (!newPos) return;

          const prevPos = prev[a._id];

          // skip update if same position (prevents flicker)
          const last = lastAmbulanceRef.current[a._id];

          if (
            last &&
            last.lat === newPos.lat &&
            last.lng === newPos.lng
          ) {
            return;
          }

          lastAmbulanceRef.current[a._id] = newPos;

          next[a._id] = prevPos
            ? interpolatePosition(prevPos, newPos, 0.2)
            : newPos;
        });

        return next;
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [ambulances]);

  return (
    <MapContainer
      center={[13.0827, 80.2707]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* ROUTES */}
      {Object.entries(routes).map(([id, route]) => (
        <Polyline
          key={id}
          positions={route.map((p) => [p.lat, p.lng])}
          color="blue"
        />
      ))}

      {/* AMBULANCES (SMOOTH MOVING) */}
      {Object.entries(animatedAmbulances).map(([id, pos]) => {
        if (!pos) return null;

        return (
          <Marker
            key={id}
            position={[pos.lat, pos.lng]}
            icon={L.icon({
              iconUrl:
                "https://cdn-icons-png.flaticon.com/512/2968/2968839.png",
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
          />
        );
      })}
    </MapContainer>
  );
}

/* ---------------- OSRM ROUTING ---------------- */
async function getRoute(start, end) {
  try {
    if (!start || !end) return [];

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    return (
      data.routes?.[0]?.geometry?.coordinates?.map((c) => ({
        lat: c[1],
        lng: c[0],
      })) || []
    );
  } catch (err) {
    console.error("Route error:", err);
    return [];
  }
}

export default function LiveEmergencyMap({
  activeEmergencies = [],
  ambulances = [],
}) {
  const [routes, setRoutes] = useState({});
  const [animatedAmbulances, setAnimatedAmbulances] = useState({});

  const routeCache = useRef({});

  /* ---------------- ROUTE CALC (CACHED + SAFE) ---------------- */
  useEffect(() => {
    let isMounted = true;

    async function loadRoutes() {
      const newRoutes = {};

      for (let e of activeEmergencies) {
        if (!e?.assignedAmbulance?.location || !e?.location) continue;

        const key = e._id;

        if (routeCache.current[key]) {
          newRoutes[key] = routeCache.current[key];
          continue;
        }

        const route = await getRoute(
          e.assignedAmbulance.location,
          e.location
        );

        routeCache.current[key] = route;
        newRoutes[key] = route;
      }

      if (isMounted) {
        setRoutes(newRoutes);
      }
    }

    loadRoutes();

    return () => {
      isMounted = false;
    };
  }, [activeEmergencies]);

  /* ---------------- SMOOTH AMBULANCE ANIMATION ---------------- */
  useEffect(() => {
    let frame;

    const animate = () => {
      setAnimatedAmbulances((prev) => {
        const updated = { ...prev };

        ambulances.forEach((a) => {
          const newPos = a?.location;
          if (!newPos) return;

          const prevPos = prev[a._id];

          updated[a._id] = prevPos
            ? interpolatePosition(prevPos, newPos, 0.25)
            : newPos;
        });

        return updated;
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [ambulances]);

  return (
    <MapContainer
      center={[13.0827, 80.2707]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* ROUTES */}
      {Object.keys(routes).map((id) => {
        const route = routes[id];

        return (
          <Polyline
            key={id}
            positions={route.map((p) => [p.lat, p.lng])}
            color="blue"
          />
        );
      })}

      {/* AMBULANCES */}
      {Object.entries(animatedAmbulances).map(([id, pos]) => {
        if (!pos) return null;

        return (
          <Marker
            key={id}
            position={[pos.lat, pos.lng]}
            icon={L.icon({
              iconUrl:
                "https://cdn-icons-png.flaticon.com/512/2968/2968839.png",
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
          />
        );
      })}
    </MapContainer>
  );
}