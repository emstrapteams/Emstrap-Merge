import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
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
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, "Invalid Indian mobile number"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔐 IMPORTANT FIX
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    role: {
      type: String,
      enum: [
        "user",
        "ambulance",
        "ambulance_driver",
        "hospital",
        "hospital_admin",
        "police",
        "police_hq",
        "admin",
      ],
      default: "user",
      index: true,
    },

    vehicleNumber: {
      type: String,
      default: "",
      trim: true,
    },

    driverStatus: {
      type: String,
      enum: ["LIVE", "OFFLINE"],
      default: "OFFLINE",
      index: true,
    },

    currentLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },

    isOnTrip: {
      type: Boolean,
      default: false,
      index: true,
    },

    activeRequest: {
      type: Schema.Types.ObjectId,
      ref: "Emergency", // ✅ FIXED
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

//
// PASSWORD HASHING
//
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

//
// PASSWORD CHECK
//
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

//
// INDEXES
//
userSchema.index({ role: 1 });
userSchema.index({ city: 1 });
userSchema.index({ driverStatus: 1 });
userSchema.index({ isOnTrip: 1 });
userSchema.index({ activeRequest: 1 });

export default model("User", userSchema);