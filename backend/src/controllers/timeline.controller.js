import IncidentTimeline from "../models/IncidentTimeline.model.js";

// ⚠️ SAFE SOCKET IMPORT (PREVENT CRASH)
let socketEmitters = {
  emitTimelineCreated: () => {},
  emitTimelineUpdated: () => {},
  emitTimelineDeleted: () => {},
};

// Try loading socket only if available
try {
  const socket = await import("../socket/timeline.socket.js");

  socketEmitters = {
    emitTimelineCreated: socket.emitTimelineCreated || (() => {}),
    emitTimelineUpdated: socket.emitTimelineUpdated || (() => {}),
    emitTimelineDeleted: socket.emitTimelineDeleted || (() => {}),
  };
} catch (err) {
  console.warn("⚠️ Socket timeline module not found, continuing without realtime updates");
}

const {
  emitTimelineCreated,
  emitTimelineUpdated,
  emitTimelineDeleted,
} = socketEmitters;

// ======================================================
// 📍 GET INCIDENT TIMELINE
// ======================================================
export const getIncidentTimeline = async (req, res) => {
  try {
    const { incidentId } = req.params;

    const timeline = await IncidentTimeline.find({ incidentId })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: timeline.length,
      timeline,
    });

  } catch (error) {
    console.error("❌ Timeline Fetch Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch timeline",
    });
  }
};

// ======================================================
// ➕ CREATE TIMELINE EVENT
// ======================================================
export const addTimelineEvent = async (req, res) => {
  try {
    const { incidentId } = req.params;

    const {
      title,
      description,
      type = "system",
      event = "CUSTOM",
      status = "",
      createdBy = req.user?._id || "SYSTEM",
      createdByModel = req.user?.role || "SYSTEM",
      location = null,
      metadata = {},
    } = req.body;

    const timeline = await IncidentTimeline.create({
      incidentId,
      title,
      description,
      type,
      event,
      status,
      createdBy,
      createdByModel,
      location,
      metadata,
    });

    // 📡 SAFE EMIT
    emitTimelineCreated(timeline);

    return res.status(201).json({
      success: true,
      message: "Timeline event created successfully",
      timeline,
    });

  } catch (error) {
    console.error("❌ Timeline Create Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create timeline event",
    });
  }
};

// ======================================================
// 🧠 INTERNAL LOGGER
// ======================================================
export const logTimeline = async ({
  incident,
  event = "CUSTOM",
  title,
  description,
  type = "system",
  status = "",
  createdBy = "SYSTEM",
  createdByModel = "SYSTEM",
  location = null,
  metadata = {},
}) => {
  try {
    const timeline = await IncidentTimeline.create({
      incidentId: incident,
      event,
      title,
      description,
      type,
      status,
      createdBy,
      createdByModel,
      location,
      metadata,
    });

    emitTimelineCreated(timeline);

    return timeline;
  } catch (error) {
    console.error("❌ Log Timeline Error:", error);
    return null;
  }
};

// ======================================================
// ⚙️ SYSTEM EVENT
// ======================================================
export const addSystemTimelineEvent = async (
  incidentId,
  title,
  description,
  event = "CUSTOM",
  type = "system",
  metadata = {}
) => {
  try {
    const timeline = await IncidentTimeline.create({
      incidentId,
      title,
      description,
      event,
      type,
      createdBy: "SYSTEM",
      createdByModel: "SYSTEM",
      metadata,
    });

    emitTimelineCreated(timeline);

    return timeline;
  } catch (error) {
    console.error("❌ System Timeline Error:", error);
    return null;
  }
};

// ======================================================
// ✏️ UPDATE
// ======================================================
export const updateTimelineEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const timeline = await IncidentTimeline.findByIdAndUpdate(
      eventId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!timeline) {
      return res.status(404).json({
        success: false,
        message: "Timeline event not found",
      });
    }

    emitTimelineUpdated(timeline);

    return res.status(200).json({
      success: true,
      message: "Timeline updated successfully",
      timeline,
    });

  } catch (error) {
    console.error("❌ Timeline Update Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update timeline",
    });
  }
};

// ======================================================
// 🗑️ DELETE
// ======================================================
export const deleteTimelineEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const timeline = await IncidentTimeline.findByIdAndDelete(eventId);

    if (!timeline) {
      return res.status(404).json({
        success: false,
        message: "Timeline event not found",
      });
    }

    emitTimelineDeleted(timeline.incidentId, timeline._id);

    return res.status(200).json({
      success: true,
      message: "Timeline deleted successfully",
    });

  } catch (error) {
    console.error("❌ Timeline Delete Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete timeline",
    });
  }
};