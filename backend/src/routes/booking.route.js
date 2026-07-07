import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  assignAmbulanceToBooking,
  completeBooking,
  processPayment,
} from "../controllers/booking.controller.js";

const router = express.Router();

// 🚨 CREATE BOOKING (LIVE TRACKING ENABLED)
router.post("/", authMiddleware, createBooking);

// 🚑 ASSIGN AMBULANCE (REAL-TIME)
router.put("/:id/assign", authMiddleware, assignAmbulanceToBooking);

// 📍 STATUS UPDATE (LIVE TRACKING)
router.put("/:id/status", authMiddleware, updateBookingStatus);

// 🏁 COMPLETE BOOKING
router.put("/:id/complete", authMiddleware, completeBooking);

// ❌ CANCEL BOOKING
router.put("/:id/cancel", authMiddleware, cancelBooking);

// 💳 PROCESS PAYMENT
router.post("/:id/payment", authMiddleware, processPayment);

// 📦 READ OPERATIONS
router.get("/", authMiddleware, getBookings);
router.get("/:id", authMiddleware, getBookingById);

export default router;