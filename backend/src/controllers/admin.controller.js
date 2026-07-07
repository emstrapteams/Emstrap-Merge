import Booking from "../models/booking.model.js";
import Emergency from "../models/emergency.model.js";
import User from "../models/user.model.js";

import { getIO } from "../socket/socket.js";
import EmergencyRequest from "../models/emergencyrequest.model.js";
import Ambulance from "../models/ambulance.model.js";

/* =========================================================
   📊 ADMIN STATS
========================================================= */
export const getAdminStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const bookings = await Booking.countDocuments();
    const emergencies = await Emergency.countDocuments();

    return res.json({
      success: true,
      data: { users, bookings, emergencies },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   👤 USER MANAGEMENT
========================================================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   🚨 EMERGENCY MANAGEMENT
========================================================= */
export const getAllEmergencies = async (req, res) => {
  try {
    const data = await Emergency.find();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecentEmergencies = async (req, res) => {
  try {
    const data = await Emergency.find().sort({ createdAt: -1 }).limit(10);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getActiveEmergencies = async (req, res) => {
  try {
    const data = await Emergency.find({ status: "ACTIVE" });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmergencyStatus = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    return res.json({ success: true, data: emergency });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEmergency = async (req, res) => {
  try {
    await Emergency.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Emergency deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   🚑 BOOKING MANAGEMENT
========================================================= */
export const getAllBookings = async (req, res) => {
  try {
    const data = await Booking.find();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   🚑 DRIVER LIVE LOCATION TRACKING
   (THIS WAS YOUR FUNCTION - NOW CORRECTLY PLACED)
========================================================= */
export const updateDriverLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const ambulanceId = req.user._id;
    const io = getIO();

    // 📡 broadcast to all dashboards
    io.to("ambulance").emit("driver_location_update", {
      ambulanceId,
      latitude,
      longitude,
      timestamp: new Date(),
    });

    // 🚑 update DB
    await Ambulance.findByIdAndUpdate(ambulanceId, {
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      lastUpdated: new Date(),
    });

    // 🔍 check active emergency request
    const active = await EmergencyRequest.findOne({
      ambulance: ambulanceId,
      status: {
        $in: [
          "AMBULANCE_ACCEPTED",
          "ARRIVED_AT_LOCATION",
          "EN_ROUTE_TO_HOSPITAL",
        ],
      },
    });

    // 📍 emit to patient tracking room
    if (active) {
      io.to(`request_${active._id}`).emit("live_tracking", {
        ambulanceId,
        latitude,
        longitude,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver location updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};