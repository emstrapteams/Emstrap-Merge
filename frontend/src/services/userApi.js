import axios from "axios";

export const updateLocation = (data) =>
  axios.post("/api/user-location/update", data);

export const getLocation = (userId) =>
  axios.get(`/api/user-location/${userId}`);