import Emergency from "../models/emergencyrequest.model.js";
import User from "../models/user.model.js";
import Hospital from "../models/hospital.model.js";
import Police from "../models/police.model.js";
import Ambulance from "../models/ambulance.model.js";
import { getBookingConnection } from "../config/bookingDb.js";
import { getBookingDbBookingModel } from "../models/bookingDbBooking.model.js";

const getBookingModel = () => {
  const bookingConnection = getBookingConnection();
  return getBookingDbBookingModel(bookingConnection);
};
export const getAlerts = async (req, res) => {
  try {
    const isHospital = req.user.role === "hospital" || req.user.role === "hospital_admin";

    let filter = {
      requestType: "EMERGENCY",
      duplicateDetected: { $ne: true }
    };

    const emergencies = await Emergency.find(filter)
      .populate("user", "name email mobile city")
      .populate("ambulance", "name email mobile vehicleNumber")
      .populate("hospital", "name address city mobile email")
      .sort({ createdAt: -1 })
      .limit(50);

    let hospitalBookings = [];
    if (isHospital) {
      try {
        const bookingConn = getBookingConnection();
        const BookingModel = getBookingDbBookingModel(bookingConn);
        const { getBookingUserModel } = await import("../models/bookingUser.model.js");
        const { getBookingDriverModel } = await import("../models/bookingDriver.model.js");
        const BookingUser = getBookingUserModel(bookingConn);
        const BookingDriver = getBookingDriverModel(bookingConn);

        const bookingsRaw = await BookingModel.find({ hospital: req.user._id })
          .populate({ path: "user", model: BookingUser, select: "name email mobile city" })
          .populate({ path: "ambulance", model: BookingDriver, select: "name email mobile vehicleNumber" })
          .sort({ createdAt: -1 })
          .limit(50);

        hospitalBookings = bookingsRaw.map((b) => {
          const obj = b.toObject ? b.toObject() : b;
          return {
            ...obj,
            requestType: "BOOKING",
            location: {
              latitude: obj.pickupLocation?.latitude || 0,
              longitude: obj.pickupLocation?.longitude || 0,
              address: obj.pickupLocation?.address || ""
            }
          };
        });
      } catch (bookingError) {
        console.error("Error fetching hospital bookings from Booking DB:", bookingError);
      }
    }

    // Combine emergencies and bookings, and sort by createdAt descending
    const combinedAlerts = [...emergencies, ...hospitalBookings].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({ success: true, alerts: combinedAlerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching alerts", error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const [totalAlerts, activeAlerts, totalHospitals, totalBookings, totalUsers, totalAmbulanceDrivers, totalPolice] = await Promise.all([
      Emergency.countDocuments(),
      Emergency.countDocuments({ status: { $in: ["PENDING", "AMBULANCE_ACCEPTED"] } }),
      Hospital.countDocuments(),
      getBookingModel().countDocuments(),
      User.countDocuments(),
      Ambulance.countDocuments(),
      Police.countDocuments(),
    ]);
    return res.status(200).json({
      success: true,
      stats: {
        totalAlerts,
        activeAlerts,
        totalHospitals,
        totalBookings,
        totalUsers,
        totalAmbulances: totalAmbulanceDrivers,
        totalPolice,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching stats", error: error.message });
  }
};

export const getOverviewStats = async (req, res) => {
  try {
    const [users, bookings, hospitals, emergencies, liveAmbulances, police] = await Promise.all([
      User.countDocuments(),
      getBookingModel().countDocuments(),
      Hospital.countDocuments(),
      Emergency.countDocuments(),
      Ambulance.countDocuments({ driverStatus: "LIVE" }),
      Police.countDocuments(),
    ]);

    return res.status(200).json({
      users,
      bookings,
      hospitals,
      emergencies,
      liveAmbulances,
      police,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching overview stats", error: error.message });
  }
};
export const updateEmergencyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "AMBULANCE_ACCEPTED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const existing = await Emergency.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Emergency not found" });
    }

    if (req.user.role === "hospital" || req.user.role === "hospital_admin") {
      if (!existing.hospital || existing.hospital.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Only the assigned hospital can manage this emergency." });
      }
    }

    const updated = await Emergency.findByIdAndUpdate(id, { status }, { new: true })
      .populate("user", "name email mobile city")
      .populate("ambulance", "name email mobile vehicleNumber");

    return res.status(200).json({ success: true, message: "Status updated", emergency: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};
