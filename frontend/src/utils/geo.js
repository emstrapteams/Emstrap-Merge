export function interpolatePosition(start, end, factor = 0.15) {
  if (
    !start ||
    !end ||
    typeof start.lat !== "number" ||
    typeof start.lng !== "number" ||
    typeof end.lat !== "number" ||
    typeof end.lng !== "number"
  ) {
    return start || end || null;
  }

  const safeFactor = Math.max(0, Math.min(1, factor));

  return {
    lat: start.lat + (end.lat - start.lat) * safeFactor,
    lng: start.lng + (end.lng - start.lng) * safeFactor,
  };
}