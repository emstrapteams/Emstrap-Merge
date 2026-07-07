import API from "./api";

const BASE_URL = "/api/hospitals";

// -----------------------------
// Generic request handler
// -----------------------------
const handleRequest = async (request) => {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    console.error("Hospital API Error:", error);
    throw error;
  }
};

// -----------------------------
// GET ALL HOSPITALS
// -----------------------------
export const getHospitals = () =>
  handleRequest(API.get(BASE_URL));

// -----------------------------
// GET SINGLE HOSPITAL
// -----------------------------
export const getHospitalById = (hospitalId) =>
  handleRequest(API.get(`${BASE_URL}/${hospitalId}`));

// -----------------------------
// CREATE HOSPITAL
// -----------------------------
export const createHospital = (payload) =>
  handleRequest(API.post(BASE_URL, payload));

// Backward compatibility (FIXED ORDER)
export const addHospital = createHospital;

// -----------------------------
// UPDATE HOSPITAL
// -----------------------------
export const updateHospital = (hospitalId, payload) =>
  handleRequest(
    API.put(`${BASE_URL}/${hospitalId}`, payload)
  );

// -----------------------------
// DELETE HOSPITAL
// -----------------------------
export const deleteHospital = (hospitalId) =>
  handleRequest(API.delete(`${BASE_URL}/${hospitalId}`));