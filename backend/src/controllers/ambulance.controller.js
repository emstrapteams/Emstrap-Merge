import User from "../models/user.model.js";
import EmergencyRequest from "../models/emergencyrequest.model.js";
import { getIO } from "../socket/socket.js";

/* =====================================================
   🗺️ GOOGLE MAP NAVIGATION HELPER
===================================================== */
const buildNavigationUrl = (from, to) => {
  if (!from || !to) return null;

  if (!from.latitude || !from.longitude) return null;
  if (!to.latitude || !to.longitude) return null;

  return `https://www.google.com/maps/dir/?api=1&origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}`;
};

/* =====================================================
   🚑 ACCEPT EMERGENCY REQUEST
===================================================== */
export const acceptEmergencyRequest = async (req, res) => {
  const session = await EmergencyRequest.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "requestId required",
      });
    }

    /* ---------------- LOCK REQUEST ---------------- */
    const request = await EmergencyRequest.findOneAndUpdate(
      { _id: requestId, status: "PENDING" },
      {
        status: "ASSIGNED",
        ambulance: req.user._id,
      },
      { new: true, session }
    )
      .populate("user", "name mobile")
      .populate("ambulance", "name mobile vehicleNumber");

    if (!request) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Request already assigned",
      });
    }

    /* ---------------- LOCK AMBULANCE ---------------- */
    const ambulance = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        role: "ambulance_driver",
        isOnTrip: false,
      },
      {
        isOnTrip: true,
        activeRequest: request._id,
        driverStatus: "LIVE",
        currentLocation: req.body.currentLocation || null,
      },
      { new: true, session }
    );

    if (!ambulance) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Ambulance already on trip",
      });
    }

    await session.commitTransaction();
    session.endSession();

    /* ---------------- NAVIGATION URL ---------------- */
    const navigationUrl = buildNavigationUrl(
      ambulance.currentLocation,
      request.location
    );

    /* ---------------- TRACKING PAYLOAD ---------------- */
    const trackingPayload = {
      requestId: request._id,
      userId: request.user,

      ambulanceId: ambulance._id,
      ambulanceName: ambulance.name,
      vehicleNumber: ambulance.vehicleNumber,

      status: "ASSIGNED",

      pickupLocation: request.location,
      currentLocation: ambulance.currentLocation,

      navigationUrl,
      eta: "Calculating...",
    };

    /* ---------------- SOCKET EVENTS ---------------- */
    const io = getIO();

    io.to("ambulance").emit("emergency_removed", { requestId });

    io.to(`user_${request.user._id}`).emit(
      "ambulance_assigned",
      trackingPayload
    );

    io.to(`ambulance_${ambulance._id}`).emit(
      "trip_started",
      trackingPayload
    );

    io.to("police").emit("police_alert", {
      request: trackingPayload,
      status: "ASSIGNED",
    });

    io.to("hospital").emit("hospital_alert", {
      request: {
        requestId,
        status: "ASSIGNED",
        ambulance: ambulance.name,
      },
      isLite: true,
    });

    return res.status(200).json({
      success: true,
      message: "Emergency accepted",
      data: trackingPayload,
    });
  } catch (error) {
    await session.abortTransaction().catch(() => {});

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   📍 DRIVER LIVE LOCATION UPDATE
===================================================== */
export const updateDriverLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const ambulanceId = req.user._id;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "latitude & longitude required",
      });
    }

    const io = getIO();

    /* ---------------- GLOBAL BROADCAST ---------------- */
    io.to("ambulance").emit("driver_location_update", {
      ambulanceId,
      latitude,
      longitude,
      timestamp: new Date(),
    });

    /* ---------------- ACTIVE REQUEST ---------------- */
    const active = await EmergencyRequest.findOne({
      ambulance: ambulanceId,
      status: {
        $in: [
          "ASSIGNED",
          "AMBULANCE_ACCEPTED",
          "ARRIVED_AT_LOCATION",
          "EN_ROUTE_TO_HOSPITAL",
        ],
      },
    });

    /* ---------------- LIVE TRACKING ---------------- */
    if (active) {
      io.to(`request_${active._id}`).emit("live_tracking", {
        ambulanceId,
        latitude,
        longitude,
      });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};