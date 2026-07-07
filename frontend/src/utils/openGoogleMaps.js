export const openGoogleMaps = (
  lat,
  lng,
  mode = "directions",
  origin = null
) => {
  if (!lat || !lng) {
    console.warn("Invalid coordinates for Google Maps");
    return;
  }

  let url = "";

  // -----------------------------
  // VIEW MODE (just show pin)
  // -----------------------------
  if (mode === "view") {
    url = `https://www.google.com/maps?q=${lat},${lng}`;
  }

  // -----------------------------
  // NAVIGATION MODE (route)
  // -----------------------------
  else if (mode === "directions") {
    if (origin) {
      url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${lat},${lng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
  }

  // -----------------------------
  // DEFAULT fallback
  // -----------------------------
  else {
    url = `https://www.google.com/maps?q=${lat},${lng}`;
  }

  window.open(url, "_blank");
};