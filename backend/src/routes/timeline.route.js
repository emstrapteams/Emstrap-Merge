import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  getIncidentTimeline,
  addTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
} from "../controllers/timeline.controller.js";

const router = Router();

// ================================
// 📍 INCIDENT TIMELINE ROUTES
// ================================

/**
 * GET full timeline for an incident
 * GET /api/timeline/incident/:incidentId
 */
router.get(
  "/incident/:incidentId",
  authMiddleware,
  getIncidentTimeline
);

/**
 * ADD new timeline event
 * POST /api/timeline/incident/:incidentId
 */
router.post(
  "/incident/:incidentId",
  authMiddleware,
  addTimelineEvent
);

/**
 * UPDATE timeline event
 * PUT /api/timeline/event/:eventId
 */
router.put(
  "/event/:eventId",
  authMiddleware,
  updateTimelineEvent
);

/**
 * DELETE timeline event
 * DELETE /api/timeline/event/:eventId
 */
router.delete(
  "/event/:eventId",
  authMiddleware,
  deleteTimelineEvent
);

export default router;