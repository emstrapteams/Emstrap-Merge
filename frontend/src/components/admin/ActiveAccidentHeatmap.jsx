import EmergencyRequest from "../models/emergencyrequest.model.js";
import User from "../models/user.model.js";

/* -------------------- DISTANCE (Haversine KM) -------------------- */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/* -------------------- MAIN ENGINE -------------------- */
export async function autoDispatchEmergency(io, emergency) {
  try {
    if (!emergency?.location) return null;

    const { latitude, longitude } = emergency.location;

    /* ===============================
       FETCH AVAILABLE AMBULANCES
    =============================== */
    const ambulances = await User.find({
      role: "ambulance",
      status: "available",
    });

    if (!ambulances.length) {
      io.to("admin").emit("dispatch_failed", {
        emergencyId: emergency._id,
        reason: "NO_AMBULANCE_AVAILABLE",
      });
      return null;
    }

    /* ===============================
       FIND NEAREST AMBULANCE
    =============================== */
    let bestAmbulance = null;
    let bestDistance = Infinity;

    ambulances.forEach((amb) => {
      if (!amb.currentLocation) return;

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
    });

    if (!bestAmbulance) return null;

    /* ===============================
       ETA CALC (REALISTIC)
    =============================== */
    const etaMinutes = Math.max(2, Math.round(bestDistance * 2.2));

    /* ===============================
       UPDATE DATABASE STATE
    =============================== */
    await EmergencyRequest.findByIdAndUpdate(emergency._id, {
      ambulance: bestAmbulance._id,
      status: "AMBULANCE_ASSIGNED",
    });

    await User.findByIdAndUpdate(bestAmbulance._id, {
      status: "dispatched",
      activeRequest: emergency._id,
    });

    /* ===============================
       PAYLOAD (FRONTEND OPTIMIZED)
    =============================== */
    const payload = {
      requestId: emergency._id,
      ambulance: {
        id: bestAmbulance._id,
        name: bestAmbulance.name,
        mobile: bestAmbulance.mobile,
        vehicleNumber: bestAmbulance.vehicleNumber,
        location: bestAmbulance.currentLocation,
      },
      emergencyLocation: emergency.location,
      distance: bestDistance.toFixed(2),
      eta: etaMinutes,
      priority: emergency.priority || "HIGH",
      status: "AMBULANCE_ASSIGNED",
    };

    /* ===============================
       SOCKET SYSTEM (FIXED + CONSISTENT)
    =============================== */

    // 1. ONLY selected ambulance
    io.to(`driver_${bestAmbulance._id}`).emit("new_assignment", payload);

    // 2. Emergency tracking room (USER MAP)
    io.to(`request_${emergency._id}`).emit("ambulance_assigned", payload);

    // 3. Hospital network
    io.to("hospital").emit("hospital_alert", payload);

    // 4. Police network
    io.to("police").emit("police_new_case", payload);

    // 5. Admin monitoring
    io.to("admin").emit("dispatch_update", payload);

    return {
      ambulance: bestAmbulance,
      eta: etaMinutes,
    };
  } catch (err) {
    console.error("AutoDispatch Error:", err.message);
    return null;
  }
}