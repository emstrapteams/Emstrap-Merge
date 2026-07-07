import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import socket from "../../socket";
import API from "../../services/api";

export default function HospitalLiveMap() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD INITIAL DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/hospital/ambulances");
        const data = res.data?.data || res.data || [];
        setAmbulances(data);
      } catch (err) {
        console.error("Failed to load hospital ambulances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------- REALTIME SOCKET UPDATES ---------------- */
  useEffect(() => {
    const handleLocation = (data) => {
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

    const handleAssignment = (data) => {
      if (!data?.requestId) return;

      setAmbulances((prev) =>
        prev.map((amb) =>
          amb._id === data.ambulanceId
            ? {
                ...amb,
                assigned: true,
                currentRequest: data.requestId,
                driverName: data.driverName || amb.driverName,
              }
            : amb
        )
      );
    };

    socket.on("ambulance_location", handleLocation);
    socket.on("ambulance_assigned", handleAssignment);

    return () => {
      socket.off("ambulance_location", handleLocation);
      socket.off("ambulance_assigned", handleAssignment);
    };
  }, []);

  return (
    <>
      <Navbar />

      <Container>
        <div className="py-6 space-y-5">

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Hospital Live Ambulance Tracking
          </h1>

          {/* MAP PLACEHOLDER */}
          <div className="w-full h-[600px] rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">

            {loading ? (
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-3 text-gray-500">
                  Loading hospital map...
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Hospital Live Map Ready 🏥🚑
                <p className="text-sm mt-2">
                  (Attach Leaflet/Google Maps here later)
                </p>
              </div>
            )}

          </div>

          {/* LIST VIEW */}
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
                  Status: {amb.assigned ? "Assigned" : "Available"}
                </p>

                <p className="text-sm text-gray-500">
                  Lat: {amb.location?.lat || "--"}
                </p>

                <p className="text-sm text-gray-500">
                  Lng: {amb.location?.lng || "--"}
                </p>

                {amb.currentRequest && (
                  <p className="text-xs text-blue-600 mt-2">
                    Active Request: {amb.currentRequest}
                  </p>
                )}

                <div className="mt-2 text-xs text-green-600 font-semibold">
                  LIVE
                </div>
              </div>
            ))}

          </div>

        </div>
      </Container>
    </>
  );
}