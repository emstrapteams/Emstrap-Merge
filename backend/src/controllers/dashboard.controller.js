import Emergency from "../models/emergencyrequest.model.js";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import { getIO } from "../socket/socket.js";

/* ---------------- CONSTANTS ---------------- */

const EMERGENCY_STATUSES = [
  "PENDING",
  "AMBULANCE_ACCEPTED",
  "ARRIVED_AT_LOCATION",
  "EN_ROUTE_TO_HOSPITAL",
  "COMPLETED",
  "CANCELLED",
];

/* ---------------- ROLE HELPERS ---------------- */

const USER_ROLES = {
  USERS: "user",
  AMBULANCE: "ambulance_driver",
  HOSPITAL: "hospital",
  POLICE: ["police", "police_hq"],
};

/* ---------------- MAP HELPER (NEW) ---------------- */

const buildMapsUrl = (loc) => {
  if (!loc?.latitude || !loc?.longitude) return null;
  return `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
};

/* ---------------- ALERTS ---------------- */

export const getAlerts = async (req, res) => {
  try {
    const alerts = await Emergency.find({ requestType: "EMERGENCY" })
      .populate("user", "name email mobile city")
      .populate("ambulance", "name email mobile vehicleNumber")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const enriched = alerts.map((a) => ({
      ...a,
      mapsUrl: buildMapsUrl(a.location),
    }));

    return res.json({
      success: true,
      count: enriched.length,
      alerts: enriched,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
      error: err.message,
    });
  }
};

/* ---------------- STATS ---------------- */

export const getStats = async (req, res) => {
  try {
    const [
      totalAlerts,
      activeAlerts,
      totalHospitals,
      totalBookings,
      totalUsers,
      totalAmbulances,
      totalPolice,
    ] = await Promise.all([
      Emergency.countDocuments(),

      Emergency.countDocuments({
        status: {
          $in: [
            "PENDING",
            "AMBULANCE_ACCEPTED",
            "ARRIVED_AT_LOCATION",
            "EN_ROUTE_TO_HOSPITAL",
          ],
        },
      }),

      User.countDocuments({ role: USER_ROLES.HOSPITAL }),

      Booking.countDocuments(),

      User.countDocuments({ role: USER_ROLES.USERS }),

      User.countDocuments({ role: USER_ROLES.AMBULANCE }),

      User.countDocuments({ role: { $in: USER_ROLES.POLICE } }),
    ]);

    return res.json({
      success: true,
      stats: {
        totalAlerts,
        activeAlerts,
        totalHospitals,
        totalBookings,
        totalUsers,
        totalAmbulances,
        totalPolice,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: err.message,
    });
  }
};

/* ---------------- OVERVIEW ---------------- */

export const getOverviewStats = async (req, res) => {
  try {
    const [
      users,
      bookings,
      hospitals,
      emergencies,
      liveAmbulances,
      police,
    ] = await Promise.all([
      User.countDocuments({ role: USER_ROLES.USERS }),
      Booking.countDocuments(),
      User.countDocuments({ role: USER_ROLES.HOSPITAL }),
      Emergency.countDocuments(),
      User.countDocuments({
        role: USER_ROLES.AMBULANCE,
        driverStatus: "LIVE",
      }),
      User.countDocuments({ role: { $in: USER_ROLES.POLICE } }),
    ]);

    return res.json({
      success: true,
      stats: {
        users,
        bookings,
        hospitals,
        emergencies,
        police,
        liveAmbulances,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch overview",
      error: err.message,
    });
  }
};

/* ---------------- UPDATE STATUS (FIXED + LIVE MAP READY) ---------------- */

export const updateEmergencyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!EMERGENCY_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const emergency = await Emergency.findById(id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    if (["COMPLETED", "CANCELLED"].includes(emergency.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot update final status",
      });
    }

    emergency.status = status;
    await emergency.save();

    const updated = await Emergency.findById(id)
      .populate("user", "name email mobile city")
      .populate("ambulance", "name email mobile vehicleNumber");

    const io = getIO();

    /* ---------------- MAP PAYLOAD ---------------- */

    const payload = {
      ...updated.toObject(),
      mapsUrl: buildMapsUrl(updated.location),
    };

    /* ---------------- FIXED SOCKET ROOMS ---------------- */

    if (updated.user) {
      io.to(`user:${updated.user._id}`).emit(
        "emergency_status_updated",
        payload
      );
    }

    if (updated.ambulance) {
      io.to(`ambulance:${updated.ambulance._id}`).emit(
        "emergency_status_updated",
        payload
      );
    }

    io.to("police").emit("emergency_status_broadcast", payload);
    io.to("hospital").emit("emergency_status_broadcast", payload);

    /* ---------------- ADMIN DASHBOARD LIVE SYNC ---------------- */

    io.to("admin").emit("dashboard_update", {
      type: "EMERGENCY_STATUS",
      data: payload,
    });

    return res.json({
      success: true,
      message: "Emergency updated",
      emergency: payload,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
};