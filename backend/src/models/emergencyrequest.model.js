import mongoose from "mongoose";

const emergencyRequestSchema = new mongoose.Schema(
  {
    // Who created the emergency request
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional patient details (if different from user)
    patientName: {
      type: String,
      trim: true,
    },

    patientPhone: {
      type: String,
      trim: true,
    },

    // Emergency type (critical for routing)
    emergencyType: {
      type: String,
      enum: [
        "accident",
        "cardiac",
        "pregnancy",
        "stroke",
        "fire",
        "trauma",
        "other",
      ],
      default: "other",
    },

    // Location of emergency (IMPORTANT for Leaflet + tracking)
    location: {
      address: {
        type: String,
        required: true,
      },

      coordinates: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    },

    // Status flow for live dashboard
    status: {
      type: String,
      enum: [
        "pending",      // created but not assigned
        "assigned",     // ambulance assigned
        "enroute",      // ambulance moving
        "arrived",      // reached location
        "completed",    // patient delivered
        "cancelled",
      ],
      default: "pending",
    },

    // Assigned ambulance + driver
    ambulance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambulance",
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },

    // Real-time tracking (for Leaflet live updates)
    liveTracking: {
      currentLocation: {
        lat: Number,
        lng: Number,
      },

      lastUpdated: {
        type: Date,
      },
    },

    // Priority handling
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Timestamps for analytics
    assignedAt: Date,
    arrivedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const EmergencyRequest = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema
);

export default EmergencyRequest;