import API from "./api";

const BASE_URL = "/api/police";

// -----------------------------
// Generic handler
// -----------------------------
const handleRequest = async (request) => {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    console.error("Police API Error:", error);
    throw error;
  }
};

/* ============================
   POLICE CASES
============================ */

export const getPoliceCases = () =>
  handleRequest(API.get(`${BASE_URL}/cases`));

export const getPoliceCaseById = (caseId) =>
  handleRequest(API.get(`${BASE_URL}/cases/${caseId}`));

export const updatePoliceCaseStatus = (caseId, status) =>
  handleRequest(
    API.put(`${BASE_URL}/cases/${caseId}/status`, { status })
  );

/* ============================
   POLICE EMERGENCIES
============================ */

export const getPoliceEmergencies = () =>
  handleRequest(API.get(`${BASE_URL}/emergencies`));

export const getPoliceEmergencyById = (emergencyId) =>
  handleRequest(API.get(`${BASE_URL}/emergencies/${emergencyId}`));

/* ============================
   POLICE RECORDS (CRUD)
============================ */

export const createPoliceRecord = (payload) =>
  handleRequest(API.post(BASE_URL, payload));

// FIXED ORDER (no circular reference bug)
export const addPoliceRecord = createPoliceRecord;

export const updatePoliceRecord = (id, payload) =>
  handleRequest(API.put(`${BASE_URL}/${id}`, payload));

export const deletePoliceRecord = (id) =>
  handleRequest(API.delete(`${BASE_URL}/${id}`));