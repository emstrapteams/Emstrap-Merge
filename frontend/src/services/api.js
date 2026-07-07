import axios from "axios";

// ================================
// BASE CONFIG
// ================================

export const API_URL = (import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

if (!API_URL) {
  console.warn("⚠️ VITE_API_URL is not set. API calls may fail.");
}

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
});

// ================================
// AUTH INTERCEPTOR
// ================================
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================================
// ERROR HANDLER
// ================================
export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

// ================================
// REQUEST WRAPPER
// ================================
const request = (promise) =>
  promise
    .then(({ data }) => data)
    .catch((error) => {
      console.error("========== API ERROR ==========");
      console.error("URL:", error.config?.baseURL + error.config?.url);
      console.error("Method:", error.config?.method?.toUpperCase());
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      console.error(error);

      throw error;
    });

// ================================
// TEST
// ================================
export const getApiTest = () => request(API.get("/api/test"));

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
    }

    return Promise.reject(error);
  }
);

// ================================
// AUTH
// ================================
export const registerAPI = (userData) =>
  request(API.post("/auth/register", userData));

export const loginAPI = (userData) =>
  request(API.post("/auth/login", userData));

export const adminLoginAPI = (userData) =>
  request(API.post("/auth/admin/login", userData));

export const setupAdmin = (userData) =>
  request(API.post("/auth/setup-admin", userData));

export const logout = () => request(API.post("/auth/logout"));

export const verifyEmailAPI = (token) =>
  request(API.get(`/auth/verify-email/${token}`));

export const forgotPasswordAPI = (email) =>
  request(API.post("/auth/forgot-password", { email }));

export const resetPasswordAPI = (token, password) =>
  request(API.put(`/auth/reset-password/${token}`, { password }));

export const changePasswordAPI = (currentPassword, newPassword) =>
  request(
    API.put("/auth/change-password", {
      currentPassword,
      newPassword,
    })
  );

// ================================
// EMERGENCY (CORE SYSTEM)
// ================================
export const getDriverHistory = (filter = "24h") =>
  request(API.get(`/api/emergency/driver/history?filter=${filter}`));

export const acceptEmergency = (id) =>
  request(API.put(`/api/emergency/${id}/accept`));

export const declineEmergency = (id) =>
  request(API.put(`/api/emergency/${id}/decline`));

export const cancelEmergency = (id) =>
  request(API.put(`/api/emergency/${id}/cancel`));

export const markArrivedAPI = (id) =>
  request(API.put(`/api/emergency/${id}/mark-arrived`));

export const completeEmergencyAPI = (id) =>
  request(API.put(`/api/emergency/${id}/complete`));

export const getEmergencyDetailsAPI = (id) =>
  request(API.get(`/api/emergency/${id}`));

export const getHospitals = () =>
  request(API.get("/api/hospitals"));

export const assignHospital = (emergencyId, hospitalId) =>
  request(
    API.put(`/api/emergency/${emergencyId}/assign-hospital`, {
      hospitalId,
    })
  );

// ================================
// AMBULANCE
// ================================
export const getAmbulances = () =>
  request(API.get("/api/ambulances"));

export const getAmbulanceById = (id) =>
  request(API.get(`/api/ambulances/${id}`));

export const createAmbulance = (payload) =>
  request(API.post("/api/ambulances", payload));

export const updateAmbulance = (id, payload) =>
  request(API.put(`/api/ambulances/${id}`, payload));

export const deleteAmbulance = (id) =>
  request(API.delete(`/api/ambulances/${id}`));

// ================================
// ADMIN
// ================================
export const getAllUsers = () =>
  request(API.get("/api/admin/users"));

export const updateUserRole = (userId, role) =>
  request(API.put(`/api/admin/users/${userId}/role`, { role }));

export const deleteUserById = (userId) =>
  request(API.delete(`/api/admin/users/${userId}`));

export const getAllEmergencies = () =>
  request(API.get("/api/admin/emergencies"));

export const updateEmergencyStatus = (id, status) =>
  request(
    API.put(`/api/admin/emergencies/${id}/status`, { status })
  );

export const getRecentEmergencies = () =>
  request(API.get("/api/admin/emergencies/recent"));

export const getActiveEmergencies = () =>
  request(API.get("/api/admin/emergencies/active"));

export const deleteEmergencyById = (id) =>
  request(API.delete(`/api/admin/emergencies/${id}`));

export const getAdminStats = (range = "1D") =>
  request(API.get("/api/admin/stats", { params: { range } }));

// ================================
// BOOKINGS
// ================================
export const getAllAdminBookings = () =>
  request(API.get("/api/admin/bookings"));

export const updateBookingStatus = (bookingId, status) =>
  request(
    API.put(`/api/admin/bookings/${bookingId}/status`, { status })
  );

export const deleteBookingById = (bookingId) =>
  request(API.delete(`/api/admin/bookings/${bookingId}`));

export const cancelBookingAPI = (id) =>
  request(API.put(`/api/bookings/${id}/cancel`));

export const getBookingByIdAPI = (id) =>
  request(API.get(`/api/bookings/${id}`));

export const getPaymentStatusAPI = (id) =>
  request(API.get(`/api/bookings/${id}/payment`));

export const processPaymentAPI = (id, paymentMethod) =>
  request(API.post(`/api/bookings/${id}/pay`, { paymentMethod }));

// ================================
// DASHBOARD
// ================================
export const getAlerts = () => request(API.get("/api/alerts"));

export const updateHospitalAlertStatus = (id, status) =>
  request(API.put(`/api/emergencies/${id}/status`, { status }));

export const getStats = () => request(API.get("/api/stats"));

export const getOverviewStats = () =>
  request(API.get("/api/overview-stats"));

// ================================
// POLICE
// ================================
export const getPoliceEmergencies = () =>
  request(API.get("/api/police/emergencies"));

export const getPoliceCases = () =>
  request(API.get("/api/police/cases"));

export const updatePoliceCaseStatus = (caseId, status) =>
  request(
    API.put(`/api/police/cases/${caseId}/status`, { status })
  );

// ======================================================
// ✅ ADDED MISSING EXPORTS (FIX FOR YOUR VITE ERROR)
// ======================================================

// INCIDENTS (frontend expected this)
export const fetchIncidentsAPI = () =>
  request(API.get("/api/incidents"));

// EMERGENCIES alias (frontend mismatch fix)
export const getEmergencies = () =>
  request(API.get("/api/emergency"));

// POLICE UNITS (missing in admin dashboard)
export const getPoliceUnits = () =>
  request(API.get("/api/police/units"));

// POLICE RECORDS (missing)
export const getPoliceRecords = () =>
  request(API.get("/api/police/records"));

// USERS aliases (AdminUsers.jsx expects these names)
export const getUsers = getAllUsers;
export const deleteUser = deleteUserById;
export const updateUser = (id, data) =>
  request(API.put(`/api/admin/users/${id}`, data));

// PAYMENT (missing exports used in PaymentPage.jsx)
export const createPaymentIntentAPI = (data) =>
  request(API.post("/api/payment/create-intent", data));

export const verifyPaymentAPI = (data) =>
  request(API.post("/api/payment/verify", data));

// ================================
// EXPORT DEFAULT
// ================================
export default API;