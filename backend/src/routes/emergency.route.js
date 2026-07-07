import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createEmergencyRequest,
  acceptEmergency,
  declineEmergency,
  getDriverHistory,
  cancelEmergency,
  assignHospital,
  completeRequest,
  getEmergencyDetails,
  markArrived,
  updateDriverLocation
} from "../controllers/emergency.controller.js";

const router = express.Router();

// 🚨 CREATE EMERGENCY
router.post("/", authMiddleware, createEmergencyRequest);

// 🚑 AMBULANCE FLOW
router.put("/:id/accept", authMiddleware, acceptEmergency);
router.put("/:id/decline", authMiddleware, declineEmergency);
router.put("/:id/mark-arrived", authMiddleware, markArrived);

// 🏥 HOSPITAL FLOW
router.put("/:id/assign-hospital", authMiddleware, assignHospital);

// 🏁 COMPLETE FLOW
router.put("/:id/complete", authMiddleware, completeRequest);

// ❌ CANCEL FLOW
router.put("/:id/cancel", authMiddleware, cancelEmergency);

// 📍 LOCATION & INFO
router.put("/location", authMiddleware, updateDriverLocation);
router.get("/driver/history", authMiddleware, getDriverHistory);
router.get("/:id", authMiddleware, getEmergencyDetails);

export default router;