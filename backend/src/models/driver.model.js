import mongoose, { Schema } from "mongoose";

const driverSchema = new Schema(
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

    address: String,

    city: {
      type: String,
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
      latitude: Number,
      longitude: Number,
    },

    // 🚨 REAL-TIME DISPATCH LINK
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
      default: "private_driver",
      enum: ["private_driver"],
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // 🚑 REAL-TIME TRACKING SUPPORT
    socketId: {
      type: String,
      default: null,
    },

    lastLocationUpdate: {
      type: Date,
      default: null,
    },

    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

//
// INDEXES (IMPORTANT FOR DISPATCH SPEED)
//
driverSchema.index({ driverStatus: 1 });
driverSchema.index({ isOnTrip: 1 });
driverSchema.index({ activeEmergency: 1 });
driverSchema.index({ activeBooking: 1 });

export default mongoose.model("Driver", driverSchema);