import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let bookingConnection = null;

export const connectBookingDB = async () => {
  try {
    if (bookingConnection) {
      return bookingConnection;
    }

    if (!process.env.MONGO_URI_BOOKING) {
      throw new Error("MONGO_URI_BOOKING is not configured");
    }

    bookingConnection = await mongoose
      .createConnection(process.env.MONGO_URI_BOOKING, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 20,
        minPoolSize: 5,
        autoIndex: true,
        family: 4,
      })
      .asPromise();

    bookingConnection.on("connected", () => {
      console.log("✅ Booking MongoDB Connected");
    });

    bookingConnection.on("error", (err) => {
      console.error("❌ Booking MongoDB Error:", err.message);
    });

    bookingConnection.on("disconnected", () => {
      console.warn("⚠️ Booking MongoDB Disconnected");
      bookingConnection = null;
    });

    console.log("✅ Booking DB Ready");

    return bookingConnection;
  } catch (error) {
    bookingConnection = null;
    console.error("❌ Failed to connect Booking DB:", error.message);
    throw error;
  }
};

export const getBookingConnection = () => {
  if (!bookingConnection) {
    throw new Error(
      "Booking database is not connected. Call connectBookingDB() first."
    );
  }

  return bookingConnection;
};

export default connectBookingDB;