const errorHandler = (err, req, res, next) => {
    console.error("=================================");
    console.error("🔥 ERROR:", err);
    console.error("=================================");

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // =========================
    // 🧩 Mongoose Errors
    // =========================

    // Invalid ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}`;
    }

    // Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((error) => error.message)
            .join(", ");
    }

    // Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }

    // =========================
    // 🔐 JWT Errors
    // =========================

    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid authentication token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Authentication token has expired";
    }

    // =========================
    // 📤 Response
    // =========================

    res.status(statusCode).json({
        success: false,
        message,

        // 🧠 Only show stack in development
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};

export default errorHandler;