import { Schema, model } from "mongoose";

const policeSchema = new Schema(
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
      select: false, // 🔐 security fix
    },

    role: {
      type: String,
      default: "police",
      enum: ["police"],
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

    stationCode: {
      type: String,
      default: null,
      index: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    currentLocation: {
      latitude: Number,
      longitude: Number,
    },

    activeIncident: {
      type: Schema.Types.ObjectId,
      ref: "Emergency",
      default: null,
    },

    lastActiveAt: {
      type: Date,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: true,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

//
// INDEXES (IMPORTANT FOR EMERGENCY SEARCH)
//
policeSchema.index({ city: 1 });
policeSchema.index({ isOnline: 1 });
policeSchema.index({ activeIncident: 1 });

export default model("Police", policeSchema);