/**
 * Calculate straight-line distance between two GPS points using Haversine formula.
 * Returns distance in meters.
 */
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters

  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Calculate distance in kilometers.
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  return calculateDistanceMeters(lat1, lon1, lat2, lon2) / 1000;
};

/**
 * Estimate ETA in minutes given distance (km) and average speed (km/h).
 * Default speed is 40 km/h for urban ambulance.
 */
export const estimateEtaMinutes = (distanceKm, speedKmh = 40) => {
  if (!distanceKm || distanceKm <= 0) return 5;
  return Math.max(2, Math.round((distanceKm / speedKmh) * 60));
};

export default calculateDistanceMeters;