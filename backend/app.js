import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import timelineRoutes from "./src/routes/timeline.route.js";
import emergencyRoutes from "./src/routes/emergency.route.js";
import authRoutes from "./src/routes/user.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import policeRoutes from "./src/routes/police.route.js";
import bookingRoutes from "./src/routes/booking.route.js";
import hospitalRoutes from "./src/routes/hospital.route.js";
import ambulanceRoutes from "./src/routes/ambulance.route.js";
import dashboardRoutes from "./src/routes/dashboard.route.js";
import paymentRoutes from "./src/routes/payment.route.js";
import privateDriverRoutes from "./src/routes/privatedriver.routes.js";

import errorHandler from "./src/middlewares/error.js";

dotenv.config();

const app = express();

/* ===============================
   SECURITY HEADERS
================================ */
app.use(helmet({
  contentSecurityPolicy: false, // Allow maps/external scripts
  crossOriginEmbedderPolicy: false,
}));

/* ===============================
   RATE LIMITING
================================ */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);
app.use("/auth/", apiLimiter);

/* ===============================
   SOCKET HOLDER (GLOBAL SAFE)
================================ */
app.set("io", null);

/* ===============================
   CORS CONFIG (STRICT + CLEAN)
================================ */
const allowedOrigins = new Set([
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean));

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.has(origin)) {
                return callback(null, true);
            }
            return callback(new Error("CORS blocked: Not allowed"));
        },
        credentials: true,
    })
);

/* ===============================
   BODY PARSER
================================ */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

/* ===============================
   REQUEST CONTEXT (IO ACCESS)
================================ */
app.use((req, res, next) => {
    const io = req.app.get("io");
    req.io = io;
    next();
});

/* ===============================
   ROUTES
================================ */
app.use("/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/ambulances", ambulanceRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/drivers", privateDriverRoutes);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        service: "EMSTRAP API",
        status: "RUNNING",
        timestamp: new Date().toISOString(),
        databaseConnected: mongoose.connection.readyState === 1,
        socketEnabled: !!req.app.get("io"),
    });
});

/* ===============================
   404 HANDLER
================================ */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

/* ===============================
   GLOBAL ERROR HANDLER
================================ */
app.use(errorHandler);

export default app;