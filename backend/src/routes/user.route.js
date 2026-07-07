import { Router } from "express";
import {
  loginUser,
  getMe,
  logoutUser,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

// PUBLIC
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// PROTECTED
router.use(authMiddleware);
router.get("/me", getMe);

export default router;