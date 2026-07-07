////////////////////////
// Role Options
////////////////////////

export const roleOptions = [
  { value: "user", label: "User" },
  { value: "ambulance", label: "Ambulance" },
  { value: "ambulance_driver", label: "Ambulance Driver" },
  { value: "hospital", label: "Hospital" },
  { value: "hospital_admin", label: "Hospital Admin" },
  { value: "police", label: "Police" },
  { value: "police_hq", label: "Police HQ" },
  { value: "admin", label: "System Admin" },
];

////////////////////////
// Ambulance Status
////////////////////////

export const ambulanceStatusOptions = [
  "AVAILABLE",
  "BUSY",
  "DISPATCHED",     // 🔥 NEW (backend alignment)
  "OFFLINE",
  "MAINTENANCE",
];

////////////////////////
// Driver Status
////////////////////////

export const driverStatusOptions = [
  "LIVE",
  "OFFLINE",
];

////////////////////////
// Booking Status
////////////////////////

export const bookingStatusOptions = [
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

////////////////////////
// Emergency Status (CORE SYSTEM)
////////////////////////

export const emergencyStatusOptions = [
  "PENDING",

  // 🚑 dispatch lifecycle
  "AMBULANCE_ASSIGNED",
  "DISPATCHED",
  "EN_ROUTE",

  // 📍 live movement
  "ARRIVED_AT_LOCATION",
  "PATIENT_PICKED",
  "EN_ROUTE_TO_HOSPITAL",

  // 🏥 completion
  "COMPLETED",
  "CANCELLED",
];

////////////////////////
// Date Formatter
////////////////////////

export function formatDate(date) {
  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

////////////////////////
// Status Formatter
////////////////////////

export function formatStatus(status = "") {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

////////////////////////
// STATUS BADGE MAP
////////////////////////

const STATUS_CLASSES = {
  // ================= AMBULANCE =================
  AVAILABLE:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",

  BUSY:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",

  DISPATCHED:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",

  OFFLINE:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",

  MAINTENANCE:
    "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",

  LIVE:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",

  // ================= BOOKING =================
  ACCEPTED:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",

  IN_PROGRESS:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",

  // ================= EMERGENCY CORE =================
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",

  AMBULANCE_ASSIGNED:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",

  DISPATCHED:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",

  EN_ROUTE:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",

  ARRIVED_AT_LOCATION:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",

  PATIENT_PICKED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",

  EN_ROUTE_TO_HOSPITAL:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",

  COMPLETED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",

  CANCELLED:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

////////////////////////
// Badge Class Helper
////////////////////////

export function getStatusBadgeClasses(status) {
  return (
    STATUS_CLASSES[status] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  );
}

////////////////////////
// Base Badge Class
////////////////////////

export const badgeBaseClass =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";