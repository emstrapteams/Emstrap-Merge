import express from "express";
import UserLocation from "../models/UserLocation.js";

const router = express.Router();

/**
 * 📍 SAVE / UPDATE LOCATION
 */
router.post("/update", async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;

    if (!userId || lat == null || lng == null) {
      return res.status(400).json({
        success: false,
        message: "userId, lat, lng are required",
      });
    }

    const data = await UserLocation.findOneAndUpdate(
      { userId },
      {
        lat,
        lng,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * 📍 GET LOCATION
 */
router.get("/:userId", async (req, res) => {
  try {
    const data = await UserLocation.findOne({
      userId: req.params.userId,
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;