import { useEffect, useRef, useState } from "react";

export default function useLiveETA(driverLocation, userLocation) {
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const lastRequestRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!driverLocation || !userLocation) return;
    if (!window.google?.maps) return;

    // 🧠 throttle updates (important for GPS streaming)
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const key = JSON.stringify({ driverLocation, userLocation });

      // 🚑 skip duplicate route calculation
      if (lastRequestRef.current === key) return;
      lastRequestRef.current = key;

      const service = new window.google.maps.DirectionsService();

      service.route(
        {
          origin: driverLocation,
          destination: userLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
        },
        (result, status) => {
          if (status !== "OK" || !result?.routes?.length) return;

          const leg = result.routes[0].legs[0];

          setEta(leg.duration?.text || "--");
          setDistance(leg.distance?.text || "--");
        }
      );
    }, 1200); // 🚑 throttle delay (1.2s safe for live EMS)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [driverLocation, userLocation]);

  return { eta, distance };
}