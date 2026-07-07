import { getIO } from "./socket.js";

/* ======================================================
   INTERNAL ROOM HELPERS
====================================================== */

const emitToIncident = (io, incidentId, event, payload) => {
  io.to(`incident:${incidentId}`).emit(event, payload);
};

const emitToUser = (io, userId, event, payload) => {
  io.to(`user:${userId}`).emit(event, payload);
};

const emitToAmbulanceRole = (io, event, payload) => {
  io.to("role:ambulance").emit(event, payload);
};

const emitToAdmin = (io, event, payload) => {
  io.to("role:admin").emit(event, payload);
};

/* ======================================================
   🚑 TIMELINE CREATED (MAP + LIVE SYNC ENABLED)
====================================================== */

export const emitTimelineCreated = (timeline) => {
  try {
    const io = getIO();

    const payload = {
      ...timeline,
      uiType: "TIMELINE_CREATED",
      mapSync: {
        incidentId: timeline.incidentId,
        highlight: true,
      },
    };

    // scoped emit (IMPORTANT for dashboard scaling)
    emitToIncident(io, timeline.incidentId, "timeline_created", payload);

    if (timeline.userId) {
      emitToUser(io, timeline.userId, "timeline_created", payload);
    }

    emitToAdmin(io, "timeline_created", payload);
  } catch (err) {
    console.error("Timeline Socket Error (CREATE):", err);
  }
};

/* ======================================================
   ✏️ TIMELINE UPDATED (USED FOR LIVE MAP STATE)
====================================================== */

export const emitTimelineUpdated = (timeline) => {
  try {
    const io = getIO();

    const payload = {
      ...timeline,
      uiType: "TIMELINE_UPDATED",

      // 🔥 THIS IS FOR LEAFLET LIVE UI
      mapSync: {
        incidentId: timeline.incidentId,
        refreshRoute: true,
        refreshMarker: true,
      },
    };

    emitToIncident(io, timeline.incidentId, "timeline_updated", payload);

    if (timeline.userId) {
      emitToUser(io, timeline.userId, "timeline_updated", payload);
    }

    emitToAmbulanceRole(io, "timeline_updated", payload);
    emitToAdmin(io, "timeline_updated", payload);
  } catch (err) {
    console.error("Timeline Socket Error (UPDATE):", err);
  }
};

/* ======================================================
   🗑️ TIMELINE DELETED (REMOVE FROM MAP UI)
====================================================== */

export const emitTimelineDeleted = (incidentId, eventId) => {
  try {
    const io = getIO();

    const payload = {
      incidentId,
      eventId,
      uiType: "TIMELINE_DELETED",
      mapSync: {
        removeMarker: true,
        clearRoute: true,
      },
    };

    emitToIncident(io, incidentId, "timeline_deleted", payload);

    emitToAdmin(io, "timeline_deleted", payload);

    emitToAmbulanceRole(io, "timeline_deleted", payload);
  } catch (err) {
    console.error("Timeline Socket Error (DELETE):", err);
  }
};

/* ======================================================
   🚑 BONUS: LIVE MAP SYNC EVENT (NEW - IMPORTANT)
   (connects timeline → Leaflet + Google Maps button state)
====================================================== */

export const emitIncidentMapSync = (incidentId, data) => {
  try {
    const io = getIO();

    io.to(`incident:${incidentId}`).emit("incident_map_sync", {
      incidentId,
      ...data,

      // UI triggers
      uiType: "MAP_SYNC",
      actions: {
        updateMarker: true,
        updateRoute: true,
        updateETA: true,
      },
    });
  } catch (err) {
    console.error("Map Sync Error:", err);
  }
};

/* ======================================================
   EXPORT
====================================================== */

export default {
  emitTimelineCreated,
  emitTimelineUpdated,
  emitTimelineDeleted,
  emitIncidentMapSync,
};