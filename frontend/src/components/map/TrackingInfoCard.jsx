// TrackingInfoCard.jsx

const DASHBOARD_CONFIG = {
  user: {
    title: "🚑 Ambulance on the Way",
    roleLabel: "Driver",
  },
  ambulance: {
    title: "🚑 Navigating to Patient",
    roleLabel: "Responder",
  },
  police: {
    title: "🚓 Police Monitoring",
    roleLabel: "Officer",
  },
  hospital: {
    title: "🏥 Incoming Patient",
    roleLabel: "Ambulance",
  },
  admin: {
    title: "📡 Live Emergency Tracking",
    roleLabel: "Responder",
  },
};

const STATUS_BADGE = {
  Waiting: {
    label: "Waiting",
    className: "bg-gray-100 text-gray-700",
  },
  "On the way": {
    label: "On The Way",
    className: "bg-blue-100 text-blue-700",
  },
  "Driver Arrived": {
    label: "Driver Arrived",
    className: "bg-green-100 text-green-700",
  },
  "Going to Hospital": {
    label: "Going to Hospital",
    className: "bg-orange-100 text-orange-700",
  },
  Completed: {
    label: "Completed",
    className: "bg-gray-200 text-gray-700",
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700",
  },
};

function buildNavigation(userLocation, driverLocation) {
  if (!userLocation?.lat || !userLocation?.lng) return "#";

  let url = `https://www.google.com/maps/dir/?api=1&destination=${userLocation.lat},${userLocation.lng}&travelmode=driving`;

  if (driverLocation?.lat && driverLocation?.lng) {
    url += `&origin=${driverLocation.lat},${driverLocation.lng}`;
  }

  return url;
}

export default function TrackingInfoCard({
  dashboardType = "user",
  driverName = "Searching...",
  driverPhone = "",
  ambulanceNo = "",
  eta = "--",
  distance = "--",
  speed = "--",
  status = "Waiting",
  userLocation,
  driverLocation,
}) {
  const config = DASHBOARD_CONFIG[dashboardType] || DASHBOARD_CONFIG.user;
  const badge = STATUS_BADGE[status] || STATUS_BADGE.Waiting;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{config.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time emergency tracking
          </p>
        </div>

        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Driver Information */}
      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard title={config.roleLabel} value={driverName} />
        <InfoCard title="Ambulance No." value={ambulanceNo || "--"} />
        <InfoCard title="Phone" value={driverPhone || "--"} />
      </div>

      {/* Route Information */}
      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard title="ETA" value={eta} color="text-red-600" />
        <MetricCard title="Distance" value={distance} color="text-blue-600" />
        <MetricCard title="Speed" value={speed} color="text-green-600" />
      </div>

      {/* Locations */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500 mb-2">📍 Patient Location</p>
          <p className="font-medium break-words">
            {userLocation?.address || "Waiting for patient location..."}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500 mb-2">🚑 Ambulance Location</p>
          <p className="font-medium break-words">
            {driverLocation?.address ||
              (driverLocation?.lat && driverLocation?.lng
                ? `${driverLocation.lat.toFixed(5)}, ${driverLocation.lng.toFixed(5)}`
                : "Waiting for ambulance...")}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid sm:grid-cols-3 gap-3">
        <a
          href={buildNavigation(userLocation, driverLocation)}
          target="_blank"
          rel="noreferrer"
          className="bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-xl font-semibold transition"
        >
          🧭 Navigate
        </a>

        {userLocation?.lat && userLocation?.lng && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lng}`}
            target="_blank"
            rel="noreferrer"
            className="border rounded-xl py-3 text-center font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            📍 View Patient
          </a>
        )}

        {driverPhone && (
          <a
            href={`tel:${driverPhone}`}
            className="bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-xl font-semibold transition"
          >
            📞 Call Driver
          </a>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="font-semibold mt-2 break-words">{value}</h3>
    </div>
  );
}

function MetricCard({ title, value, color }) {
  return (
    <div className="rounded-xl border p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className={`text-2xl font-bold mt-2 ${color}`}>{value}</h3>
    </div>
  );
}