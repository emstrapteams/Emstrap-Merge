import API from "./api";

/*
|--------------------------------------------------------------------------
| Get Incident Timeline
|--------------------------------------------------------------------------
*/

export const getIncidentTimeline = async (incidentId) => {
  const { data } = await API.get(`/timeline/${incidentId}`);
  return data;
};

/*
|--------------------------------------------------------------------------
| Add Timeline Event
|--------------------------------------------------------------------------
*/

export const addTimelineEvent = async (incidentId, payload) => {
  const { data } = await API.post(
    `/timeline/${incidentId}`,
    payload
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| Update Timeline Event
|--------------------------------------------------------------------------
*/

export const updateTimelineEvent = async (
  eventId,
  payload
) => {
  const { data } = await API.put(
    `/timeline/event/${eventId}`,
    payload
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| Delete Timeline Event
|--------------------------------------------------------------------------
*/

export const deleteTimelineEvent = async (eventId) => {
  const { data } = await API.delete(
    `/timeline/event/${eventId}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| Add System Timeline Event
|--------------------------------------------------------------------------
*/

export const addSystemTimelineEvent = async (
  incidentId,
  title,
  description,
  type = "system"
) => {
  const { data } = await API.post(
    `/timeline/${incidentId}`,
    {
      title,
      description,
      type,
      createdBy: "SYSTEM",
    }
  );

  return data;
};