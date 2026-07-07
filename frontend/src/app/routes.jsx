import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";

/* =========================
   PUBLIC PAGES
========================= */
const Emergency = lazy(() => import("../pages/emergency/Emergency"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const Tracking = lazy(() => import("../pages/user/Tracking"));
const Booking = lazy(() => import("../pages/booking/Booking"));
const PaymentPage = lazy(() => import("../pages/payment/PaymentPage"));
const DashboardRouter = lazy(() => import("../pages/dashboard/DashboardRouter"));
const UserProfile = lazy(() => import("../pages/user/UserProfile"));
const DriverHistory = lazy(() => import("../pages/ambulance/DriverHistory"));

/* =========================
   ADMIN
========================= */
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminEmergencies = lazy(() => import("../pages/admin/AdminEmergencies"));
const AdminBookings = lazy(() => import("../pages/admin/AdminBookings"));
const Hospital = lazy(() => import("../pages/admin/Hospital"));
const AdminAmbulance = lazy(() => import("../pages/admin/AdminAmbulance"));
const AdminPolice = lazy(() => import("../pages/admin/AdminPolice"));

/* =========================
   HOSPITAL
========================= */
const HospitalLayout = lazy(() => import("../pages/hospital/HospitalLayout"));
const HospitalDashboard = lazy(() => import("../pages/hospital/HospitalDashboard"));
const HospitalMap = lazy(() => import("../pages/hospital/LiveMap"));
const HospitalSettings = lazy(() => import("../pages/hospital/HospitalSettings"));
const HospitalPatientRecords = lazy(() => import("../pages/hospital/PatientRecords"));

/* =========================
   POLICE
========================= */
const PoliceLayout = lazy(() => import("../pages/Police/PoliceLayout"));
const PoliceDashboard = lazy(() => import("../pages/Police/PoliceDashboard"));
const PoliceMap = lazy(() => import("../pages/Police/LiveMap"));
const PoliceSettings = lazy(() => import("../pages/Police/PoliceSettings"));

/* =========================
   LOADER
========================= */
function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full border-4 border-red-600 border-t-transparent animate-spin mb-5"></div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Loading EMSTRAP...
        </h2>
      </div>
    </div>
  );
}

/* =========================
   NOT FOUND
========================= */
function NotFound() {
  return <Navigate to="/" replace />;
}

/* =========================
   ROUTES
========================= */
export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Emergency />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 🚨 REAL-TIME TRACKING (ENHANCED CRITICAL ROUTE) */}
        <Route
          path="/tracking/:requestId"
          element={
            <ProtectedRoute>
              <Tracking />
            </ProtectedRoute>
          }
        />

        {/* ================= USER ================= */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute role="user">
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute role="user">
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* ================= DASHBOARD ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* ================= DRIVER ================= */}
        <Route
          path="/booking-history"
          element={
            <ProtectedRoute role="ambulance">
              <DriverHistory />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/overview" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/emergencies" element={<ProtectedRoute role="admin"><AdminEmergencies /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute role="admin"><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/hospitals" element={<ProtectedRoute role="admin"><Hospital /></ProtectedRoute>} />
        <Route path="/admin/ambulance" element={<ProtectedRoute role="admin"><AdminAmbulance /></ProtectedRoute>} />
        <Route path="/admin/police" element={<ProtectedRoute role="admin"><AdminPolice /></ProtectedRoute>} />

        {/* ================= HOSPITAL ================= */}
        <Route
          path="/hospital"
          element={
            <ProtectedRoute role="hospital">
              <HospitalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HospitalDashboard />} />
          <Route path="dashboard" element={<HospitalDashboard />} />
          <Route path="map" element={<HospitalMap />} />
          <Route path="settings" element={<HospitalSettings />} />
          <Route path="patient-records" element={<HospitalPatientRecords />} />
        </Route>

        {/* ================= POLICE ================= */}
        <Route
          path="/police"
          element={
            <ProtectedRoute role="police">
              <PoliceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PoliceDashboard />} />
          <Route path="dashboard" element={<PoliceDashboard />} />
          <Route path="map" element={<PoliceMap />} />
          <Route path="settings" element={<PoliceSettings />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
}