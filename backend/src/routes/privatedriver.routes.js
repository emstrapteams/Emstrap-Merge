import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

import {
  createPrivateDriver,
  getPrivateDrivers,
  updatePrivateDriver,
  deletePrivateDriver,
} from "../controllers/privateDriver.controller.js";

const router = express.Router();

/**
 * 🔐 Protect ALL private driver routes (Admin only)
 */
router.use(authMiddleware);
router.use(adminMiddleware);

// ============================
// 🚗 PRIVATE DRIVER MANAGEMENT
// ============================

// Create private driver
router.post("/", createPrivateDriver);

// Get all private drivers
router.get("/", getPrivateDrivers);

// Update private driver by ID
router.put("/:id", updatePrivateDriver);

// Delete private driver by ID
router.delete("/:id", deletePrivateDriver);

export default router;