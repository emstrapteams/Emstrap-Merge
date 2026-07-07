import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected && mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB Already Connected");
      return mongoose.connection;
    }

    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    console.log("======================================");
    console.log("📦 Connecting to MongoDB...");
    console.log("======================================");

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 20,
    });

    isConnected = true;

    console.log("======================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📂 Database : ${conn.connection.name}`);
    console.log(`🌐 Host     : ${conn.connection.host}`);
    console.log("======================================");

    // -------------------------
    // EVENT HANDLERS (ROBUST)
    // -------------------------

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Error:", err.message);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠ MongoDB Disconnected - attempting reconnect...");
      isConnected = false;

      setTimeout(() => {
        connectDB();
      }, 3000);
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔁 MongoDB Reconnected");
      isConnected = true;
    });

    return conn;
  } catch (err) {
    console.error("======================================");
    console.error("❌ MongoDB Connection Failed");
    console.error(err.message);
    console.error("======================================");

    // auto retry (important for backend stability)
    setTimeout(() => {
      connectDB();
    }, 5000);
  }
};

export default connectDB;``