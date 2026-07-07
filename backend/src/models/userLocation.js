import mongoose, { Schema } from "mongoose";

const userLocationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    latitude: Number,
    longitude: Number,
    address: String,

    isActive: {
      type: Boolean,
      default: true,
    },

    socketId: String,

    updatedAtServer: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserLocation", userLocationSchema);