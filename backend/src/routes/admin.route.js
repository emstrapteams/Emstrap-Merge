import { Router } from "express";

import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAllEmergencies,
  getRecentEmergencies,
  getActiveEmergencies,
  getAllBookings,
  deleteUser,
  updateUser,
  updateBookingStatus,
  deleteBooking,
  updateEmergencyStatus,
  deleteEmergency,
} from "../controllers/admin.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = Router();

/**
 * 🔐 ADMIN ONLY ACCESS
 */
router.use(authMiddleware);
router.use(adminMiddleware);

// ========================
// 📊 DASHBOARD STATS
// ========================
router.get("/stats", getAdminStats);

// ========================
// 👤 USER MANAGEMENT
// ========================
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// ========================
// 🚨 EMERGENCY MANAGEMENT
// ========================
router.get("/emergencies", getAllEmergencies);
router.get("/emergencies/recent", getRecentEmergencies);
router.get("/emergencies/active", getActiveEmergencies);
router.put("/emergencies/:id/status", updateEmergencyStatus);
router.delete("/emergencies/:id", deleteEmergency);

// ========================
// 🚑 BOOKING MANAGEMENT
// ========================
router.get("/bookings", getAllBookings);
router.put("/bookings/:id/status", updateBookingStatus);
router.delete("/bookings/:id", deleteBooking);

export default router;