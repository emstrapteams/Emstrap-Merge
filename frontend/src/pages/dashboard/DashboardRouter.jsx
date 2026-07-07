import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import UserDashboard from "../user/UserDashboard";
import AmbulanceDashboard from "../ambulance/AmbulanceDashboard";

/* ---------------- ROLE NORMALIZER ---------------- */
const normalizeRole = (role) => {
  if (!role) return null;

  const r = role.toLowerCase();

  if (r === "ambulance_driver" || r === "ambulance") return "ambulance";
  if (r === "hospital_admin") return "hospital";
  if (r === "police_hq") return "police";

  return r;
};

export default function DashboardRouter() {
  const { user, loading } = useAuth();

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- NOT LOGGED IN ---------------- */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);

  /* ---------------- ROLE ROUTING ---------------- */
  switch (role) {
    case "user":
      return <UserDashboard />;

    case "ambulance":
      return <AmbulanceDashboard />;

    case "hospital":
      return <Navigate to="/hospital/dashboard" replace />;

    case "police":
      return <Navigate to="/police/dashboard" replace />;

    case "admin":
      return <Navigate to="/admin" replace />;

    default:
      return (
        <div className="flex items-center justify-center min-h-screen text-red-600 font-bold">
          Unknown role: {user.role}
        </div>
      );
  }
}