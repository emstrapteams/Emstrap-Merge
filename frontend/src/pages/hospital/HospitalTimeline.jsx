import React from "react";
import {
  CheckCircle2,
  Clock3,
  Ambulance,
  HeartPulse,
  Hospital,
  UserRound,
  Radio,
} from "lucide-react";

const DEFAULT_EVENTS = [
  {
    id: 1,
    title: "Emergency Request Received",
    description: "Emergency call registered in EMSTRAP.",
    time: "09:15 AM",
    type: "emergency",
  },
  {
    id: 2,
    title: "Ambulance Assigned",
    description: "ALS Ambulance #A-102 assigned.",
    time: "09:17 AM",
    type: "ambulance",
  },
  {
    id: 3,
    title: "Patient Arrived",
    description: "Patient reached Emergency Ward.",
    time: "09:36 AM",
    type: "patient",
  },
  {
    id: 4,
    title: "Doctor Assigned",
    description: "Trauma specialist allocated.",
    time: "09:40 AM",
    type: "doctor",
  },
  {
    id: 5,
    title: "Treatment Started",
    description: "Emergency treatment initiated.",
    time: "09:45 AM",
    type: "treatment",
  },
];

function getIcon(type) {
  switch (type) {
    case "emergency":
      return <HeartPulse size={18} className="text-red-600" />;
    case "ambulance":
      return <Ambulance size={18} className="text-blue-600" />;
    case "patient":
      return <Hospital size={18} className="text-green-600" />;
    case "doctor":
      return <UserRound size={18} className="text-purple-600" />;
    case "treatment":
      return <CheckCircle2 size={18} className="text-emerald-600" />;
    default:
      return <Clock3 size={18} />;
  }
}

function getColor(type) {
  switch (type) {
    case "emergency":
      return "bg-red-100 dark:bg-red-900/30";
    case "ambulance":
      return "bg-blue-100 dark:bg-blue-900/30";
    case "patient":
      return "bg-green-100 dark:bg-green-900/30";
    case "doctor":
      return "bg-purple-100 dark:bg-purple-900/30";
    case "treatment":
      return "bg-emerald-100 dark:bg-emerald-900/30";
    default:
      return "bg-gray-100 dark:bg-gray-800";
  }
}

export default function HospitalTimeline({
  events = DEFAULT_EVENTS,
  onEventClick,
  live = true,
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800">

      {/* HEADER */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            Hospital Timeline

            {live && (
              <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 px-2 py-1 rounded-full">
                <Radio size={12} />
                LIVE
              </span>
            )}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Real-time emergency & patient activity flow
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold">
          {events.length} Events
        </span>
      </div>

      {/* TIMELINE */}
      <div className="p-6 max-h-[550px] overflow-y-auto">

        <div className="relative">

          {/* LINE */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-8">

            {events
              .slice()
              .reverse()
              .map((event, index) => (
                <div
                  key={event.id || index}
                  className="relative flex gap-5 cursor-pointer"
                  onClick={() => onEventClick?.(event)}
                >

                  {/* ICON */}
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow ${getColor(
                      event.type
                    )}`}
                  >
                    {getIcon(event.type)}
                  </div>

                  {/* CARD */}
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">

                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>

                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock3 size={12} />
                        {event.time}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {event.description}
                    </p>

                  </div>

                </div>
              ))}

          </div>
        </div>
      </div>
    </div>
  );
}