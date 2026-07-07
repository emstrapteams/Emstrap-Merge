import { Router } from "express";

import {
  getAlerts,
  getOverviewStats,
  getStats,
  updateEmergencyStatus,
} from "../controllers/dashboard.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * 🔐 Protect all dashboard routes
 */
router.use(authMiddleware);

// ========================
// 📊 DASHBOARD ANALYTICS
// ========================

router.get("/overview-stats", getOverviewStats);
router.get("/alerts", getAlerts);
router.get("/stats", getStats);

// ========================
// 🚨 EMERGENCY CONTROL
// ========================

router.put("/emergencies/:id/status", updateEmergencyStatus);

export default router;