import { useEmergency } from "../../context/EmergencyContext";
import LiveTrackingMap from "../map/LiveTrackingMap";

export default function AmbulanceFound({ driverInfo, onCancel }) {
  const { location: userLocation } = useEmergency();

  // SAFE fallback (IMPORTANT for live socket delay)
  const driverLocation =
    driverInfo?.location?.lat && driverInfo?.location?.lng
      ? driverInfo.location
      : null;

  return (
    <div className="flex flex-col gap-6 mt-6">
      
      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Ambulance Found!
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Live tracking is active — help is on the way.
        </p>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* MAP */}
        <div className="w-full lg:flex-1 bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-inner h-[350px] sm:h-[450px] lg:h-[650px] relative z-10">
          
          <LiveTrackingMap
            userLocation={userLocation}
            driverLocation={driverLocation}
            height="100%"
          />

        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-96 space-y-4 relative z-20">

          {/* DRIVER INFO */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border dark:border-gray-800">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <span className="text-green-500">🚑</span>
              Driver Details
            </h3>

            <div className="space-y-4">

              {/* VEHICLE */}
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-2xl">
                  🚐
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500">
                    Vehicle Number
                  </p>
                  <p className="font-bold text-lg">
                    {driverInfo?.vehicleNumber || "Assigning..."}
                  </p>
                </div>
              </div>

              {/* DRIVER NAME */}
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500">
                    Driver Name
                  </p>
                  <p className="font-bold text-lg">
                    {driverInfo?.driverName || "En route"}
                  </p>
                </div>
              </div>

              {/* MOBILE */}
              {driverInfo?.driverMobile && (
                <div className="flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500">
                      Mobile Number
                    </p>
                    <p className="font-bold text-lg">
                      {driverInfo.driverMobile}
                    </p>
                  </div>

                  <a
                    href={`tel:${driverInfo.driverMobile}`}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition"
                  >
                    📞
                  </a>
                </div>
              )}

            </div>
          </div>

          {/* ETA CARD */}
          <div className="bg-blue-600 rounded-3xl p-6 text-white">
            <p className="text-xs uppercase opacity-80">
              Estimated Arrival
            </p>

            <p className="text-3xl font-black">
              {driverInfo?.eta || "Calculating..."}
            </p>
          </div>

          {/* CANCEL */}
          <button
            onClick={onCancel}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-3xl transition"
          >
            Cancel Emergency Request
          </button>

        </div>
      </div>
    </div>
  );
}