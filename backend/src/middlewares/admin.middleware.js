const adminMiddleware = (req, res, next) => {
  try {
    // 🔐 Ensure user exists (must come after authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not logged in",
      });
    }

    // 👮 Admin role check
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrator privileges required.",
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

export default adminMiddleware;