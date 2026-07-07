import mongoose, { Schema } from "mongoose";

const emergencySchema = new Schema(
  {
    // 👤 WHO CREATED EMERGENCY
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 📍 LOCATION OF INCIDENT
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        default: null,
      },
    },

    // 🚨 EMERGENCY TYPE
    emergencyType: {
      type: String,
      enum: [
        "ACCIDENT",
        "HEART_ATTACK",
        "FIRE",
        "PREGNANCY",
        "VIOLENCE",
        "OTHER",
      ],
      default: "OTHER",
      index: true,
    },

    // 📡 STATUS OF EMERGENCY FLOW
    status: {
      type: String,
      enum: [
        "CREATED",
        "DISPATCHED",
        "AMBULANCE_ASSIGNED",
        "EN_ROUTE",
        "ARRIVED",
        "PATIENT_PICKED",
        "IN_TRANSIT",
        "REACHED_HOSPITAL",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "CREATED",
      index: true,
    },

    // 🚑 ASSIGNED AMBULANCE
    ambulance: {
      type: Schema.Types.ObjectId,
      ref: "Ambulance",
      default: null,
      index: true,
    },

    // 🚗 DRIVER
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
      index: true,
    },

    // 🏥 HOSPITAL DESTINATION
    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },

    // 🚓 POLICE INVOLVEMENT (optional)
    police: {
      type: Schema.Types.ObjectId,
      ref: "Police",
      default: null,
    },

    // 📦 RELATED BOOKING (if created later)
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    // 🧠 PRIORITY LEVEL
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "HIGH",
      index: true,
    },

    // 📡 REAL-TIME TRACKING DATA
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    // 🗺️ ROUTE DATA FOR MAPS
    route: {
      distanceKm: Number,
      etaMinutes: Number,
      polyline: String,
    },

    // 🔥 DISPATCH CONTROL
    isAutoAssigned: {
      type: Boolean,
      default: true,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    // 📊 TIMELINE TRACKING LINK
    timeline: [
      {
        type: Schema.Types.ObjectId,
        ref: "IncidentTimeline",
      },
    ],
  },
  {
    timestamps: true,
  }
);

//
// INDEXES (CRITICAL FOR SPEED)
//
emergencySchema.index({ status: 1 });
emergencySchema.index({ emergencyType: 1 });
emergencySchema.index({ priority: 1 });
emergencySchema.index({ ambulance: 1 });
emergencySchema.index({ driver: 1 });

export default mongoose.model("Emergency", emergencySchema);