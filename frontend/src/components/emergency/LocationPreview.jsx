import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  MapPin,
  Navigation,
  Gauge,
  Clock3,
  LocateFixed,
} from "lucide-react";

export default function LocationPreview({
  onLocation,
  liveTracking = false,
}) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsStatus, setGpsStatus] = useState("Searching...");

  const watchRef = useRef(null);
  const abortRef = useRef(null);
  const lastGeocodeRef = useRef(0);
  const latestLocationRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported.");
      setLoading(false);
      return;
    }

    const reverseGeocode = async (lat, lng) => {
      try {
        abortRef.current?.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) throw new Error();

        const data = await response.json();

        return (
          data.display_name ||
          `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        );
      } catch {
        return latestLocationRef.current?.address || "Current Location";
      }
    };

    const updateLocation = async (position) => {
      if (!isMountedRef.current) return;

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      let address =
        latestLocationRef.current?.address || "Loading address...";

      const now = Date.now();

      if (
        !latestLocationRef.current ||
        now - lastGeocodeRef.current > 20000
      ) {
        address = await reverseGeocode(lat, lng);
        lastGeocodeRef.current = now;
      }

      const newLocation = {
        lat,
        lng,
        address,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed ?? 0,
        heading: position.coords.heading ?? 0,
        timestamp: new Date(),
      };

      latestLocationRef.current = newLocation;

      if (!isMountedRef.current) return;

      setLocation(newLocation);
      setGpsStatus("GPS Active");
      setLoading(false);

      onLocation?.(newLocation);
    };

    const handleError = (err) => {
      if (!isMountedRef.current) return;

      setLoading(false);
      setGpsStatus("GPS Unavailable");

      switch (err.code) {
        case 1:
          toast.error("Location permission denied.");
          break;
        case 2:
          toast.error("Location unavailable.");
          break;
        case 3:
          toast.error("Location timeout.");
          break;
        default:
          toast.error("Unable to detect location.");
      }
    };

    if (liveTracking) {
      watchRef.current = navigator.geolocation.watchPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 2000,
        }
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    }

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }

      abortRef.current?.abort();
    };
  }, [liveTracking]); // 👈 IMPORTANT: removed onLocation dependency

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-5 flex justify-between items-center">

        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LocateFixed size={22} />
            Live Location
          </h2>

          <p className="text-red-100 text-sm mt-1">
            Your emergency location
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            gpsStatus === "GPS Active"
              ? "bg-green-500"
              : "bg-yellow-500"
          }`}
        >
          {gpsStatus}
        </span>

      </div>

      <div className="p-6">

        {loading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">
              Detecting your location...
            </p>
          </div>
        ) : (
          location && (
            <>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6">
                <div className="flex gap-3">
                  <MapPin className="text-red-600 mt-1" />
                  <div>
                    <p className="text-xs uppercase font-semibold text-gray-500">
                      Address
                    </p>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {location.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                <InfoCard
                  icon={<Navigation size={18} />}
                  title="Latitude"
                  value={location.lat.toFixed(6)}
                />

                <InfoCard
                  icon={<Navigation size={18} />}
                  title="Longitude"
                  value={location.lng.toFixed(6)}
                />

                <InfoCard
                  icon={<Gauge size={18} />}
                  title="Accuracy"
                  value={`${Math.round(location.accuracy)} m`}
                />

                <InfoCard
                  icon={<Gauge size={18} />}
                  title="Speed"
                  value={`${(location.speed ?? 0).toFixed(1)} m/s`}
                />

              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <Clock3 size={16} />
                Last Updated :{" "}
                {location.timestamp.toLocaleTimeString()}
              </div>
            </>
          )
        )}

      </div>
    </div>
  );
}

function InfoCard({ icon, title, value }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">

      <div className="flex items-center gap-2 text-red-600">
        {icon}
        <span className="text-xs uppercase font-semibold">
          {title}
        </span>
      </div>

      <p className="text-lg font-bold mt-3 text-gray-900 dark:text-white">
        {value}
      </p>

    </div>
  );
}