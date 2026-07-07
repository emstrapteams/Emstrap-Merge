import {
  Search,
  Ambulance,
  Navigation,
  UserCheck,
  Hospital,
  CheckCircle2,
} from "lucide-react";

const TIMELINE = [
  {
    key: "PENDING",
    title: "Searching Ambulance",
    description: "Finding the nearest available ambulance",
    icon: Search,
  },
  {
    key: "AMBULANCE_ACCEPTED",
    title: "Ambulance Assigned",
    description: "Driver accepted your request",
    icon: Ambulance,
  },
  {
    key: "ON_THE_WAY",
    title: "On The Way",
    description: "Ambulance is coming to your location",
    icon: Navigation,
  },
  {
    key: "PATIENT_PICKED",
    title: "Patient Picked",
    description: "Heading to the hospital",
    icon: UserCheck,
  },
  {
    key: "ARRIVED_HOSPITAL",
    title: "Reached Hospital",
    description: "Patient has reached the hospital",
    icon: Hospital,
  },
  {
    key: "COMPLETED",
    title: "Completed",
    description: "Emergency request completed",
    icon: CheckCircle2,
  },
];

export default function BookingTimeline({
  status = "PENDING",
}) {
  const currentIndex = TIMELINE.findIndex(
    (step) => step.key === status
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-bold mb-6">
        Booking Progress
      </h2>

      <div className="space-y-5">
        {TIMELINE.map((step, index) => {
          const Icon = step.icon;

          const completed = index < currentIndex;
          const active = index === currentIndex;
          const pending = index > currentIndex;

          return (
            <div
              key={step.key}
              className="flex items-start gap-4"
            >
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-11 h-11 rounded-full flex items-center justify-center transition-all
                    ${
                      completed
                        ? "bg-green-500 text-white"
                        : active
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }
                  `}
                >
                  <Icon size={20} />
                </div>

                {index !== TIMELINE.length - 1 && (
                  <div
                    className={`w-1 h-12 ${
                      completed
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-3">
                <h3
                  className={`font-semibold ${
                    completed
                      ? "text-green-600"
                      : active
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {step.description}
                </p>

                {active && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                    Current Stage
                  </span>
                )}

                {completed && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-semibold">
                    Completed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}