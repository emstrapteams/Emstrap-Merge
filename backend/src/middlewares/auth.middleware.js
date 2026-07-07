import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Ambulance from "../models/ambulance.model.js";
import Hospital from "../models/hospital.model.js";
import Police from "../models/police.model.js";
import Admin from "../models/admin.model.js";

/**
 * Universal auth middleware supporting all roles:
 * admin, user, ambulance_driver, hospital, police
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // Get token from cookie or Authorization header
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    // Role-based user lookup — CRITICAL for multi-role system
    switch (decoded.role) {
      case "admin":
        user = await Admin.findById(decoded.id).select("-password");
        // fallback: admin may be stored in User collection
        if (!user) user = await User.findById(decoded.id).select("-password");
        break;

      case "ambulance_driver":
      case "ambulance":
        user = await Ambulance.findById(decoded.id).select("-password");
        break;

      case "hospital":
      case "hospital_admin":
        user = await Hospital.findById(decoded.id).select("-password");
        break;

      case "police":
      case "police_hq":
        user = await Police.findById(decoded.id).select("-password");
        break;

      default:
        // user / any other role
        user = await User.findById(decoded.id).select("-password");
        break;
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;