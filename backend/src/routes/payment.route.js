import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  getPaymentStatus,
  processPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

// GET payment status by booking ID
router.get("/:bookingId", authMiddleware, getPaymentStatus);

// POST process payment for a booking
router.post("/:bookingId/pay", authMiddleware, processPayment);

export default router;
