import { useEffect, useState } from "react";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { socket } from "../App"; // IMPORTANT: global socket

export default function ActiveEmergencyPanel({ emergencies = [] }) {
  const [list, setList] = useState([]);

  /* ===============================
     INITIAL LOAD
  ================================= */
  useEffect(() => {
    setList(Array.isArray(emergencies) ? emergencies : []);
  }, [emergencies]);

  /* ===============================
     REAL-TIME SOCKET UPDATES
  ================================= */
  useEffect(() => {

    /* NEW EMERGENCY */
    socket.on("emergency_created", (data) => {
      setList((prev) => [data, ...prev]);
    });

    /* AMBULANCE ASSIGNED */
    socket.on("ambulance_assigned", (data) => {
      setList((prev) =>
        prev.map((item) =>
          item._id === data.requestId
            ? { ...item, status: "AMBULANCE_ASSIGNED" }
            : item
        )
      );
    });

    /* ARRIVED */
    socket.on("ambulance_arrived", (data) => {
      setList((prev) =>
        prev.map((item) =>
          item._id === data.requestId
            ? { ...item, status: "ARRIVED_AT_LOCATION" }
            : item
        )
      );
    });

    /* COMPLETED */
    socket.on("emergency_completed", (data) => {
      setList((prev) =>
        prev.map((item) =>
          item._id === data.requestId
            ? { ...item, status: "COMPLETED" }
            : item
        )
      );
    });

    /* CANCELLED */
    socket.on("emergency_cancelled", (data) => {
      setList((prev) =>
        prev.map((item) =>
          item._id === data.requestId
            ? { ...item, status: "CANCELLED" }
            : item
        )
      );
    });

    return () => {
      socket.off("emergency_created");
      socket.off("ambulance_assigned");
      socket.off("ambulance_arrived");
      socket.off("emergency_completed");
      socket.off("emergency_cancelled");
    };
  }, []);

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold">🚨 Active Emergencies</h2>
          <p className="text-sm text-gray-500">
            Live emergency tracking system
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
          {list.length}
        </span>
      </div>

      {/* EMPTY STATE */}
      {list.length === 0 ? (
        <div className="py-14 text-center text-gray-500">
          No active emergencies.
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {list.map((item) => (
            <div
              key={item._id}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <div className="flex items-start justify-between">

                {/* LEFT */}
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-500" />
                    <h3 className="font-semibold">
                      {item.emergencyType || "Emergency"}
                    </h3>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-5 text-sm text-gray-500">

                    <div className="flex items-center gap-1">
                      <MapPin size={15} />
                      {item.location?.address ||
                        item.address ||
                        "Live Location"}
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock size={15} />
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "--"}
                    </div>
                  </div>
                </div>

                {/* STATUS */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === "PENDING"
                      ? "bg-red-100 text-red-700"
                      : item.status === "AMBULANCE_ASSIGNED"
                      ? "bg-yellow-100 text-yellow-700"
                      : item.status === "ARRIVED_AT_LOCATION"
                      ? "bg-blue-100 text-blue-700"
                      : item.status === "EN_ROUTE_TO_HOSPITAL"
                      ? "bg-purple-100 text-purple-700"
                      : item.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : item.status === "CANCELLED"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.status || "UNKNOWN"}
                </span>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}