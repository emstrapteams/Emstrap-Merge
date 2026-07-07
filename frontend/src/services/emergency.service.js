import API from "./api";

const BASE_URL = "/api/emergency";

// -----------------------------
// Generic request handler
// -----------------------------
const request = async (promise) => {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    console.error("Emergency API Error:", error);
    throw error;
  }
};

/* =========================================================
   🚨 EMERGENCY LIFECYCLE (CITIZEN SIDE)
========================================================= */

export const startEmergency = (payload) =>
  request(API.post(BASE_URL, payload));

export const getEmergency = (id) =>
  request(API.get(`${BASE_URL}/${id}`));

export const cancelEmergency = (id) =>
  request(API.put(`${BASE_URL}/${id}/cancel`));

/* =========================================================
   🚑 DRIVER / AMBULANCE FLOW
========================================================= */

export const acceptEmergency = (id) =>
  request(API.put(`${BASE_URL}/${id}/accept`));

export const declineEmergency = (id) =>
  request(API.put(`${BASE_URL}/${id}/decline`));

export const markArrived = (id) =>
  request(API.put(`${BASE_URL}/${id}/mark-arrived`));

export const completeEmergency = (id) =>
  request(API.put(`${BASE_URL}/${id}/complete`));

/* =========================================================
   🏥 HOSPITAL ASSIGNMENT
========================================================= */

export const assignHospital = (emergencyId, hospitalId) =>
  request(
    API.put(`${BASE_URL}/${emergencyId}/assign-hospital`, {
      hospitalId,
    })
  );

/* =========================================================
   📊 TRACKING / HISTORY
========================================================= */

export const getDriverHistory = (filter = "24h") =>
  request(
    API.get(`${BASE_URL}/driver/history?filter=${filter}`)
  );

/* OPTIONAL: keep ONLY one source of truth */
export const getEmergencyDetails = getEmergency;