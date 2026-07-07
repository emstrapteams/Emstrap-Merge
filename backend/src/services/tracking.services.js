/* ===============================
   GOOGLE MAPS NAVIGATION LINK
=============================== */

/**
 * Open Google Maps navigation (turn-by-turn)
 */
export function getGoogleMapsNavigationUrl(origin, destination) {
  if (!origin || !destination) return null;

  return `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;
}

/**
 * Open Google Maps directly (no route UI)
 */
export function getGoogleMapsLocationUrl(location) {
  if (!location) return null;

  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
}