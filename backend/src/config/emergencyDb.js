import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let connected = false;

export const connectEmergencyDB = async () => {
  try {
    if (connected) {
      return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 20,
      minPoolSize: 5,
      autoIndex: true,
      family: 4,
    });

    connected = true;

    mongoose.connection.on("connected", () => {
      console.log("✅ Emergency MongoDB Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Emergency MongoDB Error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ Emergency MongoDB Disconnected");
      connected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 Emergency MongoDB Reconnected");
      connected = true;
    });

    return mongoose.connection;
  } catch (error) {
    connected = false;
    console.error("❌ Failed to connect Emergency MongoDB:", error.message);
    throw error;
  }
};

export default connectEmergencyDB;