import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { getIO } from "../socket/socket.js";
import {
  DEFAULT_ADMIN,
  ensureDefaultAdminUser,
  verifyPasswordAndUpgradeIfNeeded,
} from "../utils/adminAuth.js";

/* ---------------- CONFIG ---------------- */

const JWT_EXPIRES_IN = "7d";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phoneRegex = /^[6-9]\d{9}$/;

/* ---------------- TOKEN ---------------- */

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing in environment");
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const sendTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

/* ---------------- LOGIN ---------------- */

export const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await verifyPasswordAndUpgradeIfNeeded(user, password);

    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ message: "Verify email first" });
    }

    const token = signToken(user);
    sendTokenCookie(res, token);

    user.lastLogin = new Date();
    await user.save();

    /* ---------------- SOCKET SYNC ---------------- */

    const io = getIO();

    const location = user.currentLocation || null;

    const sessionPayload = {
      userId: user._id,
      role: user.role,
      name: user.name,

      location,

      isLive: true,
      isTrackingEnabled: true,

      googleMapsUrl: location
        ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
        : null,
    };

    if (user.role === "ambulance_driver" || user.role === "ambulance" || user.role === "driver") {
      io.to("role:ambulance").emit("driver_online", sessionPayload);
    }

    if (user.role === "police" || user.role === "police_hq") {
      io.to("role:police").emit("user_online", sessionPayload);
    }

    if (user.role === "hospital" || user.role === "hospital_admin") {
      io.to("role:hospital").emit("user_online", sessionPayload);
    }

    io.to(`user:${user._id}`).emit("session_started", sessionPayload);


    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        location,
        googleMapsUrl: sessionPayload.googleMapsUrl,
        isLive: true,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ---------------- GET ME ---------------- */

export const getMe = async (req, res) => {
  const user = req.user;

  const location = user?.currentLocation || null;

  return res.json({
    ...user._doc,
    googleMapsUrl: location
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : null,
    isLive: true,
  });
};

/* ---------------- LOGOUT ---------------- */

export const logoutUser = async (req, res) => {
  try {
    const io = getIO();

    if (req.user?._id) {
      io.to(`user:${req.user._id}`).emit("session_ended", {
        userId: req.user._id,
      });
    }

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.json({ message: "Logged out" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};