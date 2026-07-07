import { Schema, model } from "mongoose";

const ambulanceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    mobile: {
      type: String,
      required: true,
      index: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
      index: true,
    },

    vehicleNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    driverStatus: {
      type: String,
      enum: ["LIVE", "OFFLINE"],
      default: "OFFLINE",
      index: true,
    },

    isOnTrip: {
      type: Boolean,
      default: false,
      index: true,
    },

    currentLocation: {
      latitude: {
        type: Number,
        default: 0,
      },
      longitude: {
        type: Number,
        default: 0,
      },
    },

    // 🚨 DISPATCH SYSTEM LINK
    activeEmergency: {
      type: Schema.Types.ObjectId,
      ref: "Emergency",
      default: null,
      index: true,
    },

    activeBooking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },

    role: {
      type: String,
      default: "ambulance_driver",
      enum: ["ambulance_driver"],
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLocationUpdate: {
      type: Date,
      default: null,
    },

    // 🚑 REAL-TIME SOCKET SUPPORT
    socketId: {
      type: String,
      default: null,
    },

    lastSeen: {
      type: Date,
      default: null,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

//
// INDEXES (IMPORTANT FOR DISPATCH SPEED)
//
ambulanceSchema.index({ driverStatus: 1 });
ambulanceSchema.index({ isOnTrip: 1 });
ambulanceSchema.index({ activeEmergency: 1 });
ambulanceSchema.index({ city: 1 });

export default model("Ambulance", ambulanceSchema);