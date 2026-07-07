import { Server } from "socket.io";

let io;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

// ===============================
// THROTTLING (GPS OPTIMIZATION)
// ===============================
const lastLocationUpdate = new Map();
const LOCATION_THROTTLE_MS = 1500;

// ===============================
// INIT SOCKET
// ===============================
export const initSocket = (server, app) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // 🔥 IMPORTANT: attach io to express app
  if (app) {
    app.set("io", io);
  }

  io.on("connection", (socket) => {
    console.log("🟢 CONNECTED:", socket.id);

    // ===============================
    // ROOMS
    // ===============================
    socket.on("join_user", ({ userId }) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on("join_driver", ({ driverId }) => {
      if (!driverId) return;
      socket.join(`driver:${driverId}`);
      socket.join("role:ambulance");
    });

    socket.on("join_hospital", ({ hospitalId }) => {
      if (!hospitalId) return;
      socket.join(`hospital:${hospitalId}`);
      socket.join("role:hospital");
    });

    socket.on("join_police", () => socket.join("role:police"));
    socket.on("join_admin", () => socket.join("role:admin"));

    socket.on("join_request", ({ requestId }) => {
      if (requestId) socket.join(`request:${requestId}`);
    });

    // ===============================
    // 🚑 LIVE DRIVER LOCATION
    // ===============================
    socket.on("driver_location_update", (data) => {
      const {
        driverId,
        requestId,
        latitude,
        longitude,
        speed = 0,
        heading = 0,
      } = data;

      if (!driverId || latitude == null || longitude == null) return;

      const now = Date.now();
      const last = lastLocationUpdate.get(driverId) || 0;

      // throttle updates
      if (now - last < LOCATION_THROTTLE_MS) return;
      lastLocationUpdate.set(driverId, now);

      const payload = {
        driverId,
        requestId,
        location: { latitude, longitude },
        speed,
        heading,
        isMoving: speed > 0,
        timestamp: now,
      };

      // ===============================
      // GLOBAL BROADCAST (IMPORTANT FIX)
      // ===============================

      // Admin dashboard
      io.to("role:admin").emit("ambulance_location", payload);

      // Hospital dashboard
      io.to("role:hospital").emit("ambulance_location", payload);

      // Police dashboard
      io.to("role:police").emit("ambulance_location", payload);

      // Specific request tracking (user view)
      if (requestId) {
        io.to(`request:${requestId}`).emit("ambulance_location", payload);
      }

      // Driver confirmation
      io.to(`driver:${driverId}`).emit("location_ack", payload);
    });

    // ===============================
    // DISCONNECT
    // ===============================
    socket.on("disconnect", () => {
      console.log("🔴 DISCONNECTED:", socket.id);
    });
  });

  return io;
};

// ===============================
// GET IO INSTANCE
// ===============================
export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};