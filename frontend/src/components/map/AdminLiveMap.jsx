import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import socket from "../../socket";
import API from "../../services/api";

export default function AdminLiveMap() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD INITIAL DATA ---------------- */
  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const res = await API.get("/admin/ambulances"); 
        const data = res.data?.data || res.data || [];
        setAmbulances(data);
      } catch (err) {
        console.error("Failed to load ambulances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAmbulances();
  }, []);

  /* ---------------- REAL TIME UPDATES ---------------- */
  useEffect(() => {
    const handleLocationUpdate = (data) => {
      if (!data?.ambulanceId) return;

      setAmbulances((prev) =>
        prev.map((amb) =>
          amb._id === data.ambulanceId
            ? {
                ...amb,
                location: {
                  lat: data.lat ?? data.latitude ?? data.location?.latitude,
                  lng: data.lng ?? data.longitude ?? data.location?.longitude,
                },
              }
            : amb
        )
      );
    };

    socket.on("ambulance_location", handleLocationUpdate);

    return () => {
      socket.off("ambulance_location", handleLocationUpdate);
    };
  }, []);

  return (
    <>
      <Navbar />

      <Container>
        <div className="py-6 space-y-4">

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Live Ambulance Map
          </h1>

          {/* MAP PLACEHOLDER (replace with Leaflet/Google later if you want) */}
          <div className="w-full h-[600px] rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">

            {loading ? (
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-3 text-gray-500">Loading live map...</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Live Map Ready 🚑  
                <p className="text-sm mt-2">
                  (Connect Leaflet/Google Maps here)
                </p>
              </div>
            )}

          </div>

          {/* LIST VIEW (backup tracking) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {ambulances.map((amb) => (
              <div
                key={amb._id}
                className="p-4 rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-700"
              >
                <h3 className="font-bold text-gray-800 dark:text-white">
                  {amb.name || "Ambulance"}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Driver: {amb.driverName || "Not assigned"}
                </p>

                <p className="text-sm text-gray-500">
                  Lat: {amb.location?.lat || "--"}
                </p>

                <p className="text-sm text-gray-500">
                  Lng: {amb.location?.lng || "--"}
                </p>

                <div className="mt-2 text-xs text-green-600 font-semibold">
                  LIVE TRACKING
                </div>
              </div>
            ))}

          </div>

        </div>
      </Container>
    </>
  );
}