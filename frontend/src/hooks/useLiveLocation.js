import { useEffect, useRef, useState } from "react";
import { updateLocation } from "../services/userApi";

export default function useLiveLocation(userId) {
  const [location, setLocation] = useState({
    lat: 20.5937,
    lng: 78.9629,
  });

  const lastSentRef = useRef(null);
  const watchIdRef = useRef(null);

  // 🧠 distance filter (prevents micro GPS jitter spam)
  const hasMovedSignificantly = (prev, next) => {
    if (!prev) return true;

    const dx = prev.lat - next.lat;
    const dy = prev.lng - next.lng;

    return Math.sqrt(dx * dx + dy * dy) > 0.0005; // ~50m threshold
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setLocation(newLoc);

        // 🚑 throttle backend updates (important)
        const now = Date.now();

        if (
          !lastSentRef.current ||
          now - lastSentRef.current.time > 3000 || // 3 sec throttle
          hasMovedSignificantly(lastSentRef.current.loc, newLoc)
        ) {
          lastSentRef.current = {
            loc: newLoc,
            time: now,
          };

          updateLocation({
            userId,
            lat: newLoc.lat,
            lng: newLoc.lng,
          });
        }
      },
      (err) => console.log("Geo error:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [userId]);

  return location;
}