import dns from "node:dns";
import dotenv from "dotenv";
import http from "http";
import process from "node:process";

dotenv.config();

import app from "./app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/socket/socket.js";
import { ensureDefaultAdminUser } from "./src/utils/adminAuth.js";

// ===============================
// DNS OPTIMIZATION
// ===============================
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// ===============================
// HTTP SERVER
// ===============================
const server = http.createServer(app);

// ===============================
// SOCKET INIT
// ===============================
initSocket(server, app);

// ===============================
// PORT
// ===============================
let PORT = Number(process.env.PORT) || 5000;

// ===============================
// SAFE LISTEN FUNCTION
// ===============================
const startListening = () => {
  server.listen(PORT, () => {
    console.log("\n======================================");
    console.log("🚀 SERVER RUNNING");
    console.log(`🌐 PORT: ${PORT}`);
    console.log(`🌍 ENV: ${process.env.NODE_ENV || "development"}`);
    console.log("📡 SOCKET.IO ACTIVE");
    console.log("======================================\n");
  });
};

// ===============================
// PORT HANDLING
// ===============================
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`⚠ Port ${PORT} in use. Trying ${PORT + 1}...`);
    PORT += 1;

    setTimeout(() => {
      startListening();
    }, 1000);

    return;
  }

  console.error("❌ Server Error:", err);
  process.exit(1);
});

// ===============================
// GLOBAL ERROR HANDLERS
// ===============================
process.on("unhandledRejection", (err) => {
  console.error("⚠ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  process.exit(1);
});

// ===============================
// GRACEFUL SHUTDOWN
// ===============================
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.log("❌ Forced shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ===============================
// START SERVER
// ===============================
const startServer = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");

    await connectDB();
    console.log("✅ MongoDB Connected");

    await ensureDefaultAdminUser();
    console.log("👤 Default admin verified");

    startListening();

    console.log("⚡ Socket.IO initialized successfully");
  } catch (err) {
    console.error("\n❌ SERVER START FAILED");
    console.error(err.message);
    process.exit(1);
  }
};

startServer();