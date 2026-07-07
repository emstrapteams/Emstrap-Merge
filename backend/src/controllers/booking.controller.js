import Booking from "../models/booking.model.js";
import EmergencyRequest from "../models/emergencyRequest.model.js";
import { getIO } from "../socket/socket.js";
import { logTimeline } from "./timeline.controller.js";

const AMBULANCE_RATES = {
  BASIC: { baseRate: 100, minFare: 250 },
  OXYGEN: { baseRate: 150, minFare: 400 },
  ICU: { baseRate: 250, minFare: 600 },
  PREGNANT: { baseRate: 200, minFare: 500 },
};

const VALID_PAYMENT_METHODS = ["CASH", "CARD", "UPI"];

const formatBookingForMap = (booking) => ({
  id: booking._id,
  bookingId: booking._id,
  user: booking.user,
  driver: booking.driver,
  ambulance: booking.ambulance,
  hospital: booking.hospital,
  pickupLocation: booking.pickupLocation,
  dropoffLocation: booking.dropoffLocation,
  ambulanceType: booking.ambulanceType,
  estimatedPrice: booking.estimatedPrice,
  distanceKm: booking.distanceKm,
  status: booking.status,
  paymentStatus: booking.paymentStatus,
  createdAt: booking.createdAt,
});

export const createBooking = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, ambulanceType, needs, distanceKm, paymentMethod } = req.body;
    const rate = AMBULANCE_RATES[ambulanceType] || AMBULANCE_RATES.BASIC;
    const estimatedPrice = Math.max((distanceKm || 0) * rate.baseRate, rate.minFare);
    const finalPaymentMethod = VALID_PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : "CASH";

    const booking = await Booking.create({
      user: req.user._id,
      pickupLocation,
      dropoffLocation,
      ambulanceType,
      needs,
      distanceKm,
      estimatedPrice: parseFloat(estimatedPrice.toFixed(2)),
      paymentMethod: finalPaymentMethod,
      status: "PENDING",
      paymentStatus: "PENDING",
    });

    await logTimeline({
      incident: booking._id,
      event: "BOOKING_CREATED",
      title: "Booking Created",
      description: "User requested ambulance",
      type: "booking",
      createdBy: req.user._id,
      createdByModel: "User",
    });

    // Fix geojson and schema mismatch
    const emergency = await EmergencyRequest.create({
      user: req.user._id,
      location: {
        address: pickupLocation.address || "Unknown Location",
        coordinates: {
          lat: pickupLocation.latitude,
          lng: pickupLocation.longitude,
        }
      },
      status: "pending",
      emergencyType: "other"
    });

    booking.emergency = emergency._id;
    await booking.save();

    const populated = await EmergencyRequest.findById(emergency._id).populate("user", "name mobile email city address");
    const io = getIO();
    const payload = {
      _id: populated._id,
      bookingId: booking._id,
      user: populated.user,
      pickupLocation,
      dropoffLocation,
      ambulanceType,
      estimatedPrice: booking.estimatedPrice,
      distanceKm,
      paymentMethod: booking.paymentMethod,
      status: "PENDING",
      paymentStatus: "PENDING",
      createdAt: populated.createdAt,
    };

    io.to("role:ambulance").emit("new_emergency_request", payload);
    io.to("role:police").emit("police_new_case", payload);
    io.to("role:admin").emit("booking_created", payload);
    io.to(`user:${req.user._id}`).emit("booking_created", payload);
    io.to(`booking:${booking._id}`).emit("tracking_started", payload);
    
    // Lite payload for hospital
    io.to("role:hospital").emit("hospital_alert", { request: { _id: populated._id, status: "pending", pickupLocation }, isLite: true });

    return res.status(201).json({ success: true, data: formatBookingForMap(booking) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("driver", "name mobile vehicleNumber")
      .populate("ambulance", "vehicleNumber")
      .populate("hospital", "name address city")
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("driver", "name mobile vehicleNumber")
      .populate("ambulance", "vehicleNumber");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const assignAmbulanceToBooking = async (req, res) => {
  try {
    const { ambulanceId, driverId } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { ambulance: ambulanceId, driver: driverId, status: "ACCEPTED" }, { new: true });
    
    if (booking.emergency) {
      await EmergencyRequest.findByIdAndUpdate(booking.emergency, { status: "assigned", ambulance: ambulanceId, driver: driverId });
    }

    const io = getIO();
    io.to(`booking:${req.params.id}`).emit("ambulance_assigned", { bookingId: req.params.id, ambulanceId, driverId });
    io.to("role:admin").emit("ambulance_assigned_booking", { bookingId: req.params.id });

    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    const statusMap = {
      "DISPATCHED": "enroute",
      "ARRIVED": "arrived",
      "COMPLETED": "completed",
    };
    
    if (booking.emergency && statusMap[status]) {
       await EmergencyRequest.findByIdAndUpdate(booking.emergency, { status: statusMap[status] });
    }

    const io = getIO();
    io.to(`booking:${req.params.id}`).emit("status_update", { bookingId: req.params.id, status });
    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "COMPLETED" }, { new: true });
    if (booking.emergency) {
      await EmergencyRequest.findByIdAndUpdate(booking.emergency, { status: "completed" });
    }
    const io = getIO();
    io.to(`booking:${req.params.id}`).emit("booking_completed", { bookingId: req.params.id, status: "COMPLETED" });
    io.to("role:admin").emit("booking_completed", { bookingId: req.params.id });
    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "CANCELLED" }, { new: true });
    if (booking.emergency) {
      await EmergencyRequest.findByIdAndUpdate(booking.emergency, { status: "cancelled" });
    }
    const io = getIO();
    io.to(`booking:${req.params.id}`).emit("booking_cancelled", { bookingId: req.params.id });
    io.to("role:admin").emit("booking_cancelled", { bookingId: req.params.id });
    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const processPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (booking.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });
    if (booking.paymentStatus === "COMPLETED") return res.status(400).json({ message: "Already paid" });

    booking.paymentMethod = VALID_PAYMENT_METHODS.includes(req.body.paymentMethod) ? req.body.paymentMethod : booking.paymentMethod;
    booking.paymentStatus = "COMPLETED";
    booking.transactionId = `TXN-${Date.now()}`;
    booking.paidAt = new Date();
    await booking.save();

    const io = getIO();
    const payload = { bookingId: booking._id, paymentStatus: "COMPLETED", paymentMethod: booking.paymentMethod };
    io.to(`booking:${booking._id}`).emit("payment_completed", payload);
    io.to("role:ambulance").emit("payment_updated", payload);
    io.to("role:police").emit("payment_updated", payload);

    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};