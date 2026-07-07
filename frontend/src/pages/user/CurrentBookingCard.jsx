import {
  MapPin,
  Phone,
  Navigation,
  Clock,
  Ambulance,
  User,
  XCircle,
} from "lucide-react";

export default function CurrentBookingCard({
  booking,
  onCancel,
  onCallDriver,
  onTrack,
  onOpenMaps,
}) {
  if (!booking) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
        <h2 className="text-lg font-bold mb-2">Current Booking</h2>
        <p className="text-gray-500 text-sm">
          No active ambulance booking
        </p>
      </div>
    );
  }

  const {
    status,
    driverName,
    driverPhone,
    ambulanceNumber,
    eta,
    distance,
    pickupLocation,
  } = booking;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Current Booking</h2>

        <span
          className={`
            text-xs px-3 py-1 rounded-full font-semibold
            ${
              status === "ON_THE_WAY"
                ? "bg-red-100 text-red-600 animate-pulse"
                : status === "AMBULANCE_ACCEPTED"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-gray-200 text-gray-600"
            }
          `}
        >
          {status?.replaceAll("_", " ")}
        </span>
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-2 gap-3 text-sm">

        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-500" />
          <span>{driverName || "Not assigned"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Ambulance size={16} className="text-gray-500" />
          <span>{ambulanceNumber || "Pending"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <span>ETA: {eta || "--"} min</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-500" />
          <span>{distance || "--"} km</span>
        </div>
      </div>

      {/* PICKUP */}
      <div className="text-sm text-gray-600">
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          Pickup Location
        </p>
        <p>{pickupLocation || "Not available"}</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-2 pt-2">

        {/* CALL DRIVER */}
        <button
          onClick={() => onCallDriver?.(driverPhone)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500 text-white text-sm"
        >
          <Phone size={16} /> Call
        </button>

        {/* TRACK */}
        <button
          onClick={() => onTrack?.(booking)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500 text-white text-sm"
        >
          <Navigation size={16} /> Track
        </button>

        {/* GOOGLE MAPS */}
        <button
          onClick={() => onOpenMaps?.(booking)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500 text-white text-sm"
        >
          <MapPin size={16} /> Maps
        </button>

        {/* CANCEL */}
        <button
          onClick={() => onCancel?.(booking._id)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm"
        >
          <XCircle size={16} /> Cancel
        </button>
      </div>
    </div>
  );
}