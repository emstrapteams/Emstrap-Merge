import User from "../models/user.model.js";

/* -------------------- DISTANCE (Haversine) -------------------- */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* -------------------- MAIN DISPATCH ENGINE -------------------- */
export async function autoDispatchEmergency(io, emergency, ambulances) {
  if (!emergency?.location || !ambulances?.length) return null;

  const { latitude, longitude } = emergency.location;

  let bestAmbulance = null;
  let bestDistance = Infinity;

  /* ---------------- FILTER + FIND BEST AMBULANCE ---------------- */
  for (const amb of ambulances) {
    if (
      !amb?.currentLocation ||
      amb.status !== "available" ||
      amb.driverStatus !== "LIVE"
    ) {
      continue;
    }

    const dist = getDistance(
      latitude,
      longitude,
      amb.currentLocation.latitude,
      amb.currentLocation.longitude
    );

    if (dist < bestDistance) {
      bestDistance = dist;
      bestAmbulance = amb;
    }
  }

  if (!bestAmbulance) {
    return null;
  }

  /* ---------------- UPDATE DB STATE ---------------- */
  await User.findByIdAndUpdate(bestAmbulance._id, {
    status: "dispatched",
    isOnTrip: true,
    activeRequest: emergency._id,
  });

  /* ---------------- ETA CALC ---------------- */
  const etaMinutes = Math.max(5, Math.round(bestDistance * 3));

  /* ---------------- SOCKET (TARGETED, NOT GLOBAL) ---------------- */

  // notify selected ambulance only
  io.to(`ambulance_${bestAmbulance._id}`).emit("new_assignment", {
    emergencyId: emergency._id,
    distance: bestDistance,
    eta: etaMinutes,
  });

  // notify emergency room (user tracking)
  io.to(`request_${emergency._id}`).emit("ambulance_assigned", {
    ambulanceId: bestAmbulance._id,
    ambulanceName: bestAmbulance.name,
    vehicleNumber: bestAmbulance.vehicleNumber,
    eta: etaMinutes,
    distance: bestDistance,
  });

  // notify all ambulances (remove from pool)
  io.to("role:ambulance").emit("emergency_removed", {
    emergencyId: emergency._id,
  });

  return {
    ambulance: bestAmbulance,
    eta: etaMinutes,
    distance: bestDistance,
  };
}