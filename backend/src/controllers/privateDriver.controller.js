import bcrypt from "bcryptjs";

import { getBookingConnection } from "../config/bookingDb.js";
import { getBookingDriverModel } from "../models/bookingDriver.model.js";

import Ambulance from "../models/ambulance.model.js";

/* ======================================================
   ➕ CREATE PRIVATE / AMBULANCE DRIVER
====================================================== */
export const createPrivateDriver = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      address,
      city,
      vehicleNumber,
      role,
    } = req.body;

    const finalRole = role || "private_driver";

    const bookingConnection = getBookingConnection();
    const Driver = getBookingDriverModel(bookingConnection);

    // 🚫 duplicate check (both collections)
    const [existingDriver, existingAmbulance] = await Promise.all([
      Driver.findOne({ email }),
      Ambulance.findOne({ email }),
    ]);

    if (existingDriver || existingAmbulance) {
      return res.status(400).json({
        success: false,
        message: "Driver already exists",
      });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ======================================================
    // 🚑 AMBULANCE DRIVER
    // ======================================================
    if (finalRole === "ambulance_driver") {
      const driver = await Ambulance.create({
        name,
        email,
        password: hashedPassword,
        mobile,
        address,
        city,
        vehicleNumber,
        role: "ambulance_driver",
        isEmailVerified: true,
      });

      return res.status(201).json({
        success: true,
        data: driver,
      });
    }

    // ======================================================
    // 🚗 PRIVATE DRIVER
    // ======================================================
    const driver = await Driver.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      address,
      city,
      vehicleNumber,
      role: "private_driver",
      isEmailVerified: true,
    });

    return res.status(201).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   📄 GET ALL PRIVATE DRIVERS
====================================================== */
export const getPrivateDrivers = async (req, res) => {
  try {
    const bookingConnection = getBookingConnection();
    const Driver = getBookingDriverModel(bookingConnection);

    const drivers = await Driver.find().select("-password");

    return res.status(200).json({
      success: true,
      data: drivers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   ✏️ UPDATE DRIVER
====================================================== */
export const updatePrivateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "name",
      "email",
      "mobile",
      "address",
      "city",
      "vehicleNumber",
      "driverStatus",
      "isEmailVerified",
    ];

    const updatePayload = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updatePayload[field] = req.body[field];
      }
    }

    // 🔐 optional password update
    if (req.body.password?.trim()) {
      updatePayload.password = await bcrypt.hash(req.body.password, 10);
    }

    const bookingConnection = getBookingConnection();
    const Driver = getBookingDriverModel(bookingConnection);

    const driver = await Driver.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   🗑️ DELETE DRIVER
====================================================== */
export const deletePrivateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const bookingConnection = getBookingConnection();
    const Driver = getBookingDriverModel(bookingConnection);

    const driver = await Driver.findByIdAndDelete(id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};