// Clean configuration mappings placed outside the component to prevent recreation on render
const STATUS_CLASSES = {
  PENDING: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  AMBULANCE_ACCEPTED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  ARRIVED_AT_LOCATION: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  EN_ROUTE_TO_HOSPITAL: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const formatDate = (dateString) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "--" : date.toLocaleString();
};

export default function RecentEmergencyTable({ emergencies = [] }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      
      <div className="px-6 py-5 border-b dark:border-gray-800">
        <h2 className="text-lg font-bold">
          Recent Emergency Requests
        </h2>
      </div>

      {emergencies.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          No recent emergencies.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-5 py-3 text-left text-sm font-semibold">Patient</th>
                <th className="px-5 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-5 py-3 text-left text-sm font-semibold">City / Location</th>
                <th className="px-5 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-5 py-3 text-left text-sm font-semibold">Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {emergencies.map((item, index) => {
                // Fallback key matrix to prevent catastrophic list rendering breakage
                const rowKey = item._id || item.id || item.createdAt || `emergency-${index}`;

                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Patient Context */}
                    <td className="px-5 py-4 text-sm font-medium">
                      {item.patientName || item.user?.name || "Unknown"}
                    </td>

                    {/* Emergency Category */}
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.emergencyType || "--"}
                    </td>

                    {/* Region / Reverse Geocode */}
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {item.city || item.location?.address || "--"}
                    </td>

                    {/* Clean Status Badging */}
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide inline-block ${
                          STATUS_CLASSES[item.status] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {item.status || "UNKNOWN"}
                      </span>
                    </td>

                    {/* Formatted Datetime String */}
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}