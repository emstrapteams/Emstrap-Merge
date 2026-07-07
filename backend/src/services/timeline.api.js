export const createTimelineEvent = async (data) => {
  const response = await API.post("/timeline", data);
  return response.data;
};

export const getIncidentTimeline = async (incidentId) => {
  const response = await API.get(`/timeline/${incidentId}`);
  return response.data;
};

export const getLatestTimelineEvent = async (incidentId) => {
  const response = await API.get(`/timeline/latest/${incidentId}`);
  return response.data;
};

export const deleteTimeline = async (incidentId) => {
  const response = await API.delete(`/timeline/${incidentId}`);
  return response.data;
};

export const getTimelineStatistics = async () => {
  const response = await API.get("/timeline/statistics");
  return response.data;
};