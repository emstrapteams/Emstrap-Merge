import { useState, useCallback, useEffect } from "react";
import LiveTrackingMap from "./LiveTrackingMap";

export default function MapSection({
  userLocation,
  driverLocation,
  dashboardType = "user",
  emergency = null,
  vehicles = [],
  responders = [],
  onNavigate,
}) {
  const [routeInfo, setRouteInfo] = useState({
    eta: "--",
    distance: "--",
  });

  /* reset route when locations change (fix stale ETA bug) */
  useEffect(() => {
    setRouteInfo({
      eta: "--",
      distance: "--",
    });
  }, [userLocation, driverLocation]);

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
      return;
    }

    const destLat = userLocation?.lat ?? emergency?.lat;
    const destLng = userLocation?.lng ?? emergency?.lng;

    if (destLat == null || destLng == null) return;

    let url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;

    if (driverLocation?.lat != null && driverLocation?.lng != null) {
      url += `&origin=${driverLocation.lat},${driverLocation.lng}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRouteUpdate = useCallback((data) => {
    if (!data) return;

    setRouteInfo({
      eta: data.eta != null ? `${data.eta} mins` : "--",
      distance: data.distance != null ? `${data.distance} km` : "--",
    });
  }, []);

  return (
    <section className="space-y-6">

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 flex flex-col lg:flex-row justify-between items-center gap-5">

        <div>
          <h2 className="text-2xl font-bold">
            🚑 Live Emergency Tracking
          </h2>

          <p className="text-gray-500 mt-1">
            Real-time ambulance tracking with navigation
          </p>
        </div>

        {(userLocation || emergency) && (
          <button
            onClick={handleNavigation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
          >
            {dashboardType === "driver"
              ? "🗺️ Navigate in Google Maps"
              : "🗺️ View in Google Maps"}
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">

        <Card
          title="Dashboard"
          value={dashboardType.toUpperCase()}
          color="text-blue-600"
        />

        <Card
          title="Ambulances"
          value={vehicles.length}
          color="text-red-600"
        />

        <Card
          title="Responders"
          value={responders.length}
          color="text-green-600"
        />

        <Card
          title="ETA"
          value={routeInfo.eta}
          color="text-orange-600"
        />

        <Card
          title="Distance"
          value={routeInfo.distance}
          color="text-purple-600"
        />

        <Card
          title="Emergency"
          value={emergency ? "ACTIVE" : "NONE"}
          color={emergency ? "text-red-600" : "text-green-600"}
        />

      </div>

      {/* MAP */}
      <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
        <LiveTrackingMap
          dashboardType={dashboardType}
          userLocation={userLocation}
          driverLocation={driverLocation}
          emergency={emergency}
          vehicles={vehicles}
          responders={responders}
          height={650}
          onRouteUpdate={handleRouteUpdate}
        />
      </div>

      {/* INFO CARDS */}
      <div className="grid md:grid-cols-3 gap-5">

        <InfoCard
          title="📍 Patient Location"
          value={userLocation?.address || "Waiting for location..."}
        />

        <InfoCard
          title="🚑 Ambulance"
          value={
            driverLocation?.lat != null && driverLocation?.lng != null
              ? `${driverLocation.lat.toFixed(5)}, ${driverLocation.lng.toFixed(5)}`
              : "Searching..."
          }
        />

        <InfoCard
          title="🚨 Emergency Status"
          value={emergency?.status || "No Active Emergency"}
        />

      </div>
    </section>
  );
}

/* ---------------- CARDS ---------------- */

function Card({ title, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className={`text-xl font-bold mt-2 ${color}`}>
        {value}
      </h3>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-5">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="font-semibold mt-3 break-words">
        {value}
      </h3>
    </div>
  );
}