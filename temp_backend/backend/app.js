import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import timelineRoutes from "./src/routes/timeline.route.js";
import emergencyRoutes from "./src/routes/emergency.route.js";
import authRoutes from "./src/routes/user.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import policeRoutes from "./src/routes/police.route.js";
import bookingRoutes from "./src/routes/booking.route.js";
import hospitalRoutes from "./src/routes/hospital.route.js";
import usersRoutes from "./src/routes/users.route.js";
import ambulanceRoutes from "./src/routes/ambulance.route.js";
import dashboardRoutes from "./src/routes/dashboard.route.js";

import errorHandler from "./src/middlewares/error.js";

dotenv.config();

const app = express();

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/auth", authRoutes);

app.use("/api", dashboardRoutes);

app.use("/api/users", usersRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/emergency", emergencyRoutes);

app.use("/api/ambulances", ambulanceRoutes);

app.use("/api/hospitals", hospitalRoutes);

app.use("/api/police", policeRoutes);

app.use("/api/timeline", timelineRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "EMSTRAP API is running",
        timestamp: new Date().toISOString(),
        database: {
            connected: mongoose.connection.readyState === 1,
        },
    });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

export default app;