import { Router } from "express";

import {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
} from "../controllers/hospital.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = Router();

/**
 * 🔐 All hospital routes require authentication
 */
router.use(authMiddleware);

// =========================
// 🏥 PUBLIC (AUTH USERS)
// =========================
router.get("/", getHospitals);
router.get("/:id", getHospitalById);

// =========================
// 🛡️ ADMIN ONLY
// =========================
router.post("/", adminMiddleware, createHospital);
router.put("/:id", adminMiddleware, updateHospital);
router.delete("/:id", adminMiddleware, deleteHospital);

export default router;