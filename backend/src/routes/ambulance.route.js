import { Router } from "express";

import {
  createAmbulance,
  deleteAmbulance,
  getAmbulanceById,
  getAmbulances,
  updateAmbulance,
} from "../controllers/ambulance.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = Router();

/**
 * 🔐 Protect ALL ambulance management routes
 * Only authenticated ADMIN can access
 */
router.use(authMiddleware);
router.use(adminMiddleware);

// ============================
// 🚑 AMBULANCE MANAGEMENT
// ============================

// Get all ambulances
router.get("/", getAmbulances);

// Get single ambulance
router.get("/:id", getAmbulanceById);

// Create ambulance
router.post("/", createAmbulance);

// Update ambulance
router.put("/:id", updateAmbulance);

// Delete ambulance
router.delete("/:id", deleteAmbulance);

export default router;