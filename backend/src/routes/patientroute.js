import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getPatients } from "../controllers/patient.controller.js";

const router = Router();

/**
 * 👨‍⚕️ PATIENT ROUTES
 * Protected route (requires login)
 */
router.get("/", authMiddleware, getPatients);

export default router;