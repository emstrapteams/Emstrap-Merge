import EmergencyRequest from "../models/emergencyrequest.model.js";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import cloudinary from "../config/cloudinary.js";
import { getIO } from "../socket/socket.js";
import { calculateDistanceMeters } from "../utils/distance.js";

const enrichWithBookingFare = async (docs) => {
  const isArray = Array.isArray(docs);
  const list = isArray ? docs : [docs].filter(Boolean);
  if (!list.length) return isArray ? [] : null;

  const emergencyIds = list.map(d => d._id);
  const bookings = await Booking.find({ emergency: { $in: emergencyIds } });
  const map = new Map(bookings.map((b) => [b.emergency?.toString(), b]));

  return list.map((d) => {
    const obj = d.toObject();
    const b = map.get(d._id.toString());
    if (b) {
      obj.ambulanceType = b.ambulanceType || "BASIC";
      obj.estimatedPrice = b.estimatedPrice || 0;
      obj.distanceKm = b.distanceKm || 0;
      obj.bookingId = b._id;
    }
    return obj;
  });
};

export const createEmergencyRequest = async (req, res) => {
  try {
    const { latitude, longitude, address, imageUrl, emergencyType } = req.body;
    let secureImageUrl = "";
    if (imageUrl) {
      const upload = await cloudinary.uploader.upload(imageUrl, { folder: "emergencies" });
      secureImageUrl = upload.secure_url;
    }

    const request = await EmergencyRequest.create({
      user: req.user?._id,
      imageUrl: secureImageUrl,
      location: {
        address: address || "Unknown Location",
        coordinates: { lat: latitude, lng: longitude }
      },
      status: "pending",
      emergencyType: emergencyType || "other"
    });

    const populated = await EmergencyRequest.findById(request._id).populate("user", "name mobile email");
    const io = getIO();
    const payload = {
      requestId: request._id,
      userId: req.user?._id,
      location: request.location,
      status: "pending",
      request: populated
    };

    io.to("role:ambulance").emit("new_emergency_request", payload);
    io.to("role:police").emit("police_new_case", payload);
    io.to("role:admin").emit("emergency_created", payload);
    io.to("role:hospital").emit("hospital_alert", { request: populated, isLite: true });
    io.to(`user:${req.user?._id}`).emit("emergency_created", payload);
    io.to(`request:${request._id}`).emit("tracking_started", payload);

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const acceptEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await EmergencyRequest.findById(id);
    if (!existing || existing.status !== "pending") {
      return res.status(400).json({ success: false, message: "Already assigned or completed" });
    }

    const request = await EmergencyRequest.findByIdAndUpdate(
      id,
      { status: "assigned", ambulance: req.user._id, assignedAt: new Date() },
      { new: true }
    ).populate("user ambulance hospital");

    const io = getIO();
    const payload = { requestId: id, driverId: req.user?._id, driverName: req.user?.name, vehicleNumber: req.user?.vehicleNumber };
    
    io.to(`request:${id}`).emit("ambulance_assigned", payload);
    io.to("role:ambulance").emit("emergency_accepted", payload);
    io.to("role:admin").emit("emergency_updated", payload);

    const enriched = await enrichWithBookingFare(request);
    return res.status(200).json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const declineEmergency = async (req, res) => {
  try {
    const io = getIO();
    io.to(`request:${req.params.id}`).emit("ambulance_declined", { requestId: req.params.id, driverId: req.user?._id });
    return res.json({ success: true, message: "Declined successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markArrived = async (req, res) => {
  try {
    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      { status: "arrived", arrivedAt: new Date() },
      { new: true }
    );
    const io = getIO();
    io.to(`request:${req.params.id}`).emit("ambulance_arrived", { requestId: req.params.id });
    return res.json({ success: true, data: request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const assignHospital = async (req, res) => {
  try {
    const { hospitalId } = req.body;
    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      { hospital: hospitalId, status: "enroute" },
      { new: true }
    );
    const io = getIO();
    io.to(`request:${req.params.id}`).emit("hospital_assigned", { requestId: req.params.id, hospitalId });
    if (hospitalId) {
      io.to(`role:hospital`).emit("new_emergency_case", { requestId: req.params.id });
    }
    return res.json({ success: true, data: request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const completeRequest = async (req, res) => {
  try {
    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      { status: "completed", completedAt: new Date() },
      { new: true }
    );
    const io = getIO();
    io.to(`request:${req.params.id}`).emit("emergency_completed", { requestId: req.params.id });
    return res.json({ success: true, data: request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelEmergency = async (req, res) => {
  try {
    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    const io = getIO();
    io.to(`request:${req.params.id}`).emit("emergency_cancelled", { requestId: req.params.id });
    return res.json({ success: true, data: request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmergencyDetails = async (req, res) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id).populate("user ambulance hospital driver");
    if (!request) return res.status(404).json({ success: false, message: "Not found" });
    const enriched = await enrichWithBookingFare(request);
    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDriverHistory = async (req, res) => {
  try {
    const history = await EmergencyRequest.find({ ambulance: req.user?._id }).sort({ createdAt: -1 });
    const enriched = await enrichWithBookingFare(history);
    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDriverLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const ambulanceId = req.user._id;
    const io = getIO();

    await EmergencyRequest.updateMany(
      { ambulance: ambulanceId, status: { $in: ["assigned", "enroute", "arrived"] } },
      {
        $set: {
          "liveTracking.currentLocation.lat": latitude,
          "liveTracking.currentLocation.lng": longitude,
          "liveTracking.lastUpdated": new Date(),
        },
      }
    );

    io.to("role:ambulance").emit("driver_location_update", { ambulanceId, latitude, longitude });
    io.to("role:admin").emit("driver_location_update", { ambulanceId, latitude, longitude });

    const active = await EmergencyRequest.findOne({
      ambulance: ambulanceId,
      status: { $in: ["assigned", "enroute", "arrived"] },
    });

    if (active) {
      io.to(`request:${active._id}`).emit("live_tracking", { ambulanceId, latitude, longitude });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};