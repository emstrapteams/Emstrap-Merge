import User from "../models/user.model.js";

// Validate email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Validate request body
const validateHospitalPayload = (payload, isPartial = false) => {
  const requiredFields = ["name", "address", "city", "mobile", "email"];

  for (const field of requiredFields) {
    if (!isPartial && !payload[field]) {
      return `${field} is required`;
    }
  }

  if (payload.email && !isValidEmail(payload.email)) {
    return "Please provide a valid email address";
  }

  return null;
};

// ===================== GET ALL HOSPITALS =====================
export const getHospitals = async (req, res) => {
  try {
    const hospitals = await User.find({ role: "hospital" }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      hospitals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching hospitals",
      error: error.message,
    });
  }
};

// ===================== GET HOSPITAL BY ID =====================
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await User.findOne({
      _id: req.params.id,
      role: "hospital",
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    return res.status(200).json({
      success: true,
      hospital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching hospital",
      error: error.message,
    });
  }
};

// ===================== CREATE HOSPITAL =====================
export const createHospital = async (req, res) => {
  try {
    const validationError = validateHospitalPayload(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Check duplicate email
    const existingHospital = await User.findOne({
      email: req.body.email,
    });

    if (existingHospital) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hospital = await User.create({
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      mobile: req.body.mobile,
      email: req.body.email,
      password: req.body.password,
      role: "hospital",
      isEmailVerified: true,
    });

    return res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      hospital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating hospital",
      error: error.message,
    });
  }
};

// ===================== UPDATE HOSPITAL =====================
export const updateHospital = async (req, res) => {
  try {
    const validationError = validateHospitalPayload(req.body, true);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const hospital = await User.findOne({
      _id: req.params.id,
      role: "hospital",
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Check duplicate email if email is changing
    if (
      req.body.email &&
      req.body.email !== hospital.email
    ) {
      const existingHospital = await User.findOne({
        email: req.body.email,
        _id: { $ne: req.params.id },
      });

      if (existingHospital) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Update only provided fields
    const fields = [
      "name",
      "address",
      "city",
      "mobile",
      "email",
      "password",
    ];

    fields.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== ""
      ) {
        hospital[field] = req.body[field];
      }
    });

    await hospital.save();

    return res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      hospital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating hospital",
      error: error.message,
    });
  }
};

// ===================== DELETE HOSPITAL =====================
export const deleteHospital = async (req, res) => {
  try {
    const hospital = await User.findOneAndDelete({
      _id: req.params.id,
      role: "hospital",
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hospital deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting hospital",
      error: error.message,
    });
  }
};