import API from "./api";

const BASE_URL = "/api/ambulances";

// -----------------------------
// Generic request handler
// -----------------------------
const handleRequest = async (request) => {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    console.error("Ambulance API Error:", error);
    throw error;
  }
};

// -----------------------------
// CREATE
// -----------------------------
export const createAmbulance = (payload) =>
  handleRequest(API.post(BASE_URL, payload));

// Backward compatibility (FIXED ORDER)
export const addAmbulance = createAmbulance;

// -----------------------------
// READ
// -----------------------------
export const getAmbulances = () =>
  handleRequest(API.get(BASE_URL));

export const getAmbulanceById = (id) =>
  handleRequest(API.get(`${BASE_URL}/${id}`));

// -----------------------------
// UPDATE
// -----------------------------
export const updateAmbulance = (id, payload) =>
  handleRequest(API.put(`${BASE_URL}/${id}`, payload));

// -----------------------------
// DELETE
// -----------------------------
export const deleteAmbulance = (id) =>
  handleRequest(API.delete(`${BASE_URL}/${id}`));