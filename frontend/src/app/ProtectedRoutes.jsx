import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ===============================
   ROLE MAP (SAFE + CLEAN)
================================ */
const roleMap = {
  user: ["user"],
  ambulance: ["ambulance", "ambulance_driver"],
  hospital: ["hospital", "hospital_admin"],
  police: ["police", "police_hq"],
  admin: ["admin"],
};

/* ===============================
   DEFAULT ROUTES
================================ */
const defaultRoutes = {
  user: "/",
  admin: "/admin",
  ambulance: "/dashboard",
  hospital: "/hospital",
  police: "/police",
};

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  /* ===============================
     LOADING STATE
  ================================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
        <div className="h-12 w-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ===============================
     NOT LOGGED IN → LOGIN
  ================================= */
  if (!user || !user.role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const currentRole = user.role;

  /* ===============================
     ROLE VALIDATION
  ================================= */
  if (role) {
    const allowedRoles = roleMap[role] || [role];

    if (!allowedRoles.includes(currentRole)) {
      const fallback = defaultRoutes[currentRole] || "/";

      return <Navigate to={fallback} replace />;
    }
  }

  return children;
}