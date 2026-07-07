import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    pickupLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    dropoffLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    ambulanceType: {
      type: String,
      enum: ["BASIC", "OXYGEN", "ICU", "PREGNANT"],
      default: "BASIC",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "DISPATCHED",
        "ARRIVED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },

    ambulance: {
      type: Schema.Types.ObjectId,
      ref: "Ambulance",
      default: null,
      index: true,
    },

    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
      index: true,
    },

    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
      index: true,
    },

    estimatedPrice: {
      type: Number,
      default: 0,
    },

    distanceKm: {
      type: Number,
      default: 0,
    },

    needs: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI"],
      default: "CASH",
    },

    transactionId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // 🚨 CRITICAL LINK TO EMERGENCY SYSTEM
    emergency: {
      type: Schema.Types.ObjectId,
      ref: "Emergency",
      default: null,
      index: true,
    },

    // 📡 REAL-TIME TRACKING SUPPORT
    lastStatusUpdate: {
      type: Date,
      default: Date.now,
    },

    // 🗺️ LIVE MAP SUPPORT
    routeData: {
      polyline: String,
      eta: Number,
    },
  },
  {
    timestamps: true,
  }
);

//
// INDEXES FOR SPEED (IMPORTANT FOR DASHBOARD)
//
bookingSchema.index({ status: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ ambulance: 1 });
bookingSchema.index({ driver: 1 });
bookingSchema.index({ emergency: 1 });

export default mongoose.model("Booking", bookingSchema);