import mongoose, { Schema } from "mongoose";

const incidentTimelineSchema = new Schema(
  {
    emergency: {
      type: Schema.Types.ObjectId,
      ref: "Emergency",
      required: true,
      index: true,
    },

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "DISPATCHED",
        "AMBULANCE_ASSIGNED",
        "ARRIVED",
        "PICKED_UP",
        "IN_TRANSIT",
        "REACHED_HOSPITAL",
        "COMPLETED",
      ],
    },

    location: {
      latitude: Number,
      longitude: Number,
    },

    message: String,

    triggeredBy: {
      type: String,
      enum: ["SYSTEM", "USER", "DRIVER", "ADMIN"],
      default: "SYSTEM",
    },
  },
  { timestamps: true }
);

export default mongoose.model("IncidentTimeline", incidentTimelineSchema);