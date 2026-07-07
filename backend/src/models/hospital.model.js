import mongoose, { Schema } from "mongoose";

const hospitalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },

    city: {
      type: String,
      index: true,
    },

    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },

    capacity: {
      totalBeds: {
        type: Number,
        default: 0,
      },
      availableBeds: {
        type: Number,
        default: 0,
      },
    },

    isEmergencyActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    ambulanceDockCount: {
      type: Number,
      default: 0,
    },

    isOnline: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    // 🚑 ACTIVE EMERGENCIES LINKED
    activeEmergencies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Emergency",
      },
    ],

    // 🚑 TRACKING SUPPORT
    activeAmbulances: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ambulance",
      },
    ],
  },
  { timestamps: true }
);

//
// INDEXES (IMPORTANT FOR DASHBOARD + DISPATCH SPEED)
//
hospitalSchema.index({ city: 1 });
hospitalSchema.index({ isEmergencyActive: 1 });
hospitalSchema.index({ isOnline: 1 });

export default mongoose.model("Hospital", hospitalSchema);