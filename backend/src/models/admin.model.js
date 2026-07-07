import { Schema, model } from "mongoose";

const adminSchema = new Schema(
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
      minlength: 6,
      select: false,
    },

    mobile: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      default: "admin",
      enum: ["admin", "superadmin"],
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // 🚑 SYSTEM CONTROL FEATURES
    lastAction: {
      type: String,
      default: null,
    },

    lastActionAt: {
      type: Date,
      default: null,
    },

    permissions: {
      canManageUsers: { type: Boolean, default: true },
      canManageDrivers: { type: Boolean, default: true },
      canManageAmbulances: { type: Boolean, default: true },
      canManagePolice: { type: Boolean, default: true },
      canManageHospitals: { type: Boolean, default: true },
      canViewAnalytics: { type: Boolean, default: true },
    },

    // 🚨 EMERGENCY CONTROL ACCESS
    activeManagedEmergencies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Emergency",
      },
    ],
  },
  {
    timestamps: true,
  }
);

//
// INDEXES
//
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

export default model("Admin", adminSchema);