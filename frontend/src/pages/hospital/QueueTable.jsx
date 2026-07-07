import React from "react";
import {
  Clock3,
  User,
  HeartPulse,
  Ambulance,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from "lucide-react";

const PRIORITY = {
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  LOW: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const STATUS = {
  WAITING: { color: "text-yellow-600", icon: Clock3 },
  IN_TREATMENT: { color: "text-blue-600", icon: HeartPulse },
  ADMITTED: { color: "text-green-600", icon: CheckCircle2 },
  DISCHARGED: { color: "text-gray-500", icon: CheckCircle2 },
};

export default function QueueTable({
  patients = [],
  onView,
  onNavigateAmbulance, // 👈 NEW (Google Maps)
}) {
  /* ---------------- GOOGLE MAPS NAVIGATION ---------------- */
  const openGoogleMaps = (ambulance) => {
    if (!ambulance?.location?.lat || !ambulance?.location?.lng) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${ambulance.location.lat},${ambulance.location.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800 overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center p-5 border-b">
        <div>
          <h2 className="text-xl font-black">Emergency Queue</h2>
          <p className="text-sm text-gray-500">Live patient waiting list</p>
        </div>

        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
          {patients.length} Patients
        </span>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full">

          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-left text-xs uppercase text-gray-500">
              <th className="px-5 py-4">Patient</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Condition</th>
              <th className="px-5 py-4">Ambulance</th>
              <th className="px-5 py-4">Arrival</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  <AlertTriangle size={42} className="mx-auto mb-3 opacity-40" />
                  No patients in queue
                </td>
              </tr>
            ) : (
              patients.map((patient) => {
                const StatusIcon =
                  STATUS[patient.status]?.icon || Clock3;

                return (
                  <tr
                    key={patient._id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                  >

                    {/* PATIENT */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
                          <User size={18} className="text-red-600" />
                        </div>

                        <div>
                          <p className="font-bold">{patient.name}</p>
                          <p className="text-xs text-gray-500">
                            #{patient._id?.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* PRIORITY */}
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          PRIORITY[patient.priority] || PRIORITY.MEDIUM
                        }`}
                      >
                        {patient.priority || "MEDIUM"}
                      </span>
                    </td>

                    {/* CONDITION */}
                    <td className="px-5 py-4">
                      {patient.condition || "-"}
                    </td>

                    {/* AMBULANCE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Ambulance size={16} className="text-blue-600" />
                        {patient.ambulance || "-"}
                      </div>
                    </td>

                    {/* ARRIVAL */}
                    <td className="px-5 py-4">
                      {patient.arrivalTime || "--"}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      <div
                        className={`flex items-center gap-2 font-semibold ${
                          STATUS[patient.status]?.color || "text-gray-500"
                        }`}
                      >
                        <StatusIcon size={16} />
                        {patient.status?.replace("_", " ") || "WAITING"}
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4 text-center">

                      {/* VIEW */}
                      <button
                        onClick={() => onView?.(patient)}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold mr-2"
                      >
                        View
                      </button>

                      {/* GOOGLE MAP NAVIGATION */}
                      {patient.ambulanceLocation && (
                        <button
                          onClick={() =>
                            openGoogleMaps(patient.ambulanceLocation)
                          }
                          className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                        >
                          <Navigation size={12} className="inline mr-1" />
                          Navigate
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}