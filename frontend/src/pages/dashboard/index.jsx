import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import UserDashboard from "./user";
import PoliceDashboard from "./police";
import AmbulanceDashboard from "../ambulance/AmbulanceDashboard";

export default function DashboardRouter() {
  const { user, loading } = useAuth();

  /* ---------------- AUTH LOADING ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  /* ---------------- NOT LOGGED IN ---------------- */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* ---------------- ROLE ROUTING ---------------- */
  switch (user.role) {
    case "police":
    case "police_hq":
      return <PoliceDashboard />;

    case "ambulance":
    case "ambulance_driver":
      return <AmbulanceDashboard />;

    case "user":
    default:
      return <UserDashboard />;
  }
}