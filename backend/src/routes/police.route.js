import { Router } from "express";

import {
  createPoliceRecord,
  deletePoliceRecord,
  getActiveEmergencies,
  getPoliceCases,
  getPoliceById,
  getPoliceRecords,
  updateCaseStatus,
  updatePoliceRecord,
} from "../controllers/police.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import policeMiddleware from "../middlewares/police.middleware.js";

const router = Router();

/**
 * 🔐 All police routes require authentication
 */
router.use(authMiddleware);

// =====================
// 🚓 POLICE OPERATIONS
// =====================

// Active emergency incidents (police dashboard)
router.get("/emergencies", policeMiddleware, getActiveEmergencies);

// Police assigned cases
router.get("/cases", policeMiddleware, getPoliceCases);

// Update case status (e.g. investigating, resolved)
router.put("/cases/:id/status", policeMiddleware, updateCaseStatus);

// =====================
// 🛡️ ADMIN OPERATIONS
// =====================

// Get all police records
router.get("/", adminMiddleware, getPoliceRecords);

// Get single police record
router.get("/:id", adminMiddleware, getPoliceById);

// Create police record
router.post("/", adminMiddleware, createPoliceRecord);

// Update police record
router.put("/:id", adminMiddleware, updatePoliceRecord);

// Delete police record
router.delete("/:id", adminMiddleware, deletePoliceRecord);

export default router;