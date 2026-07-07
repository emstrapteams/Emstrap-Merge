const policeMiddleware = (req, res, next) => {
  try {
    // 🔐 Ensure user exists (must come after authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not logged in",
      });
    }

    // 🚓 Role check for police access
    const allowedRoles = ["police", "police_hq"];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Police authorization required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default policeMiddleware;