import Ambulance from "../models/ambulance.model.js";
import EmergencyRequest from "../models/emergencyRequest.model.js";
import { getIO } from "../socket/socket.js";
import { getDistance } from "../utils/distance.js";

export const autoAssignAmbulance = async (emergencyId) => {
  const io = getIO();

  const emergency = await EmergencyRequest.findById(emergencyId);
  if (!emergency) return null;

  const { coordinates } = emergency.location;

  const ambulances = await Ambulance.find({
    status: "AVAILABLE",
  });

  let nearest = null;
  let minDistance = Infinity;

  for (const amb of ambulances) {
    if (!amb.location?.coordinates) continue;

    const [lng, lat] = amb.location.coordinates;

    const distance = getDistance(
      coordinates[1],
      coordinates[0],
      lat,
      lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = amb;
    }
  }

  if (!nearest) {
    emergency.status = "NO_AMBULANCE_AVAILABLE";
    await emergency.save();
    return null;
  }

  // assign ambulance
  emergency.ambulance = nearest._id;
  emergency.status = "AMBULANCE_ASSIGNED";
  await emergency.save();

  await Ambulance.findByIdAndUpdate(nearest._id, {
    status: "BUSY",
  });

  // notify driver
  io.to(`ambulance_${nearest._id}`).emit("new_emergency_assigned", {
    emergencyId: emergency._id,
    location: emergency.location,
  });

  // notify admin dashboard
  io.to("ambulance").emit("ambulance_assigned", {
    emergencyId: emergency._id,
    ambulanceId: nearest._id,
  });

  return nearest;
};