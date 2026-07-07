export async function getRoute(origin, destination) {
  if (!origin || !destination) return null;

  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const url =
    `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${originStr}&destination=${destStr}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes || !data.routes.length) return null;

    const route = data.routes[0];

    const path = route.overview_polyline.points;

    return {
      polyline: decodePolyline(path),
      distance: route.legs[0].distance.text,
      duration: route.legs[0].duration.text,
      durationValue: route.legs[0].duration.value,
    };
  } catch (err) {
    console.error("Route error:", err);
    return null;
  }
}

/* ================= DECODE POLYLINE ================= */
function decodePolyline(encoded) {
  let points = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return points;
}