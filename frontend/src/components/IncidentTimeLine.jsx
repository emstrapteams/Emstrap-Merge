import { useEffect, useRef, useState, useMemo } from "react";
import {
  Activity,
  Ambulance,
  Shield,
  Hospital,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
} from "lucide-react";

import { io } from "socket.io-client";
import { API_URL } from "../services/api";
import axios from "axios";

const socket = io(API_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

// 🚑 STATIC EVENT MAP (no re-creation ever)
const EVENT_CONFIG = Object.freeze({
  CASE_CREATED: { color: "bg-red-500", icon: AlertTriangle },
  AMBULANCE_ASSIGNED: { color: "bg-orange-500", icon: Ambulance },
  POLICE_ASSIGNED: { color: "bg-blue-500", icon: Shield },
  HOSPITAL_ASSIGNED: { color: "bg-emerald-500", icon: Hospital },
  AMBULANCE_ACCEPTED: { color: "bg-yellow-500", icon: Ambulance },
  POLICE_ACCEPTED: { color: "bg-cyan-500", icon: Shield },
  AMBULANCE_STARTED: { color: "bg-indigo-500", icon: Activity },
  POLICE_STARTED: { color: "bg-indigo-500", icon: Activity },
  AMBULANCE_ARRIVED: { color: "bg-green-500", icon: CheckCircle },
  POLICE_ARRIVED: { color: "bg-green-500", icon: CheckCircle },
  PATIENT_PICKED: { color: "bg-pink-500", icon: User },
  LEFT_SCENE: { color: "bg-violet-500", icon: Activity },
  HOSPITAL_REACHED: { color: "bg-emerald-600", icon: Hospital },
  PATIENT_ADMITTED: { color: "bg-lime-500", icon: Hospital },
  CASE_COMPLETED: { color: "bg-green-700", icon: CheckCircle },
  CASE_CANCELLED: { color: "bg-red-700", icon: XCircle },
  CUSTOM: { color: "bg-gray-500", icon: Clock },
});

export default function IncidentTimeline({ incidentId }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);
  const seenEvents = useRef(new Set());
  const socketRef = useRef(null);

  // 🧠 FETCH TIMELINE (dedup + ordered safety)
  const fetchTimeline = async () => {
    try {
      const res = await axios.get(`${API_URL}/timeline/${incidentId}`);
      const data = res.data.data || [];

      const cleaned = [];
      for (const item of data) {
        if (!item?._id || seenEvents.current.has(item._id)) continue;

        seenEvents.current.add(item._id);
        cleaned.push(item);
      }

      // ⬆️ ensure correct order always
      cleaned.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setTimeline(cleaned);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 SOCKET (single instance, no duplication ever)
  useEffect(() => {
    if (!incidentId) return;

    fetchTimeline();

    socket.emit("joinIncident", incidentId);

    const handleEvent = (event) => {
      if (event.incident !== incidentId) return;
      if (!event._id || seenEvents.current.has(event._id)) return;

      seenEvents.current.add(event._id);

      setTimeline((prev) => {
        const updated = [...prev, event];
        updated.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        return updated;
      });
    };

    socket.on("timeline:new", handleEvent);

    socketRef.current = socket;

    return () => {
      socket.off("timeline:new", handleEvent);
    };
  }, [incidentId]);

  // 📍 SMART AUTO SCROLL (only last item trigger)
  useEffect(() => {
    if (!timeline.length) return;

    const last = timeline[timeline.length - 1];

    // only scroll on new event (not re-render spam)
    if (seenEvents.current.has(last._id)) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [timeline.length]);

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  // ⚡ MEMO RENDER (performance mode)
  const rendered = useMemo(() => {
    return timeline.map((item, index) => {
      const config = EVENT_CONFIG[item.event] || EVENT_CONFIG.CUSTOM;
      const Icon = config.icon;

      const isLatest = index === timeline.length - 1;

      return (
        <div key={item._id} className="relative flex mb-8">

          {/* NODE */}
          <div
            className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center z-10 shadow-md ${
              isLatest ? "animate-pulse scale-110" : ""
            }`}
          >
            <Icon size={18} className="text-white" />
          </div>

          {/* CONTENT */}
          <div className="ml-5 flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 transition-all">

            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-white">
                {item.title}
              </h3>

              <span className="text-xs text-slate-400">
                {formatTime(item.createdAt)}
              </span>
            </div>

            <p className="text-sm text-slate-400 mt-2">
              {item.description}
            </p>

            {/* 🚑 TAGS */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">

              {item.metadata?.ambulance && (
                <span className="text-red-400">🚑 Ambulance</span>
              )}

              {item.metadata?.police && (
                <span className="text-blue-400">🚓 Police</span>
              )}

              {item.metadata?.hospital && (
                <span className="text-green-400">🏥 Hospital</span>
              )}

            </div>

          </div>
        </div>
      );
    });
  }, [timeline]);

  if (loading)
    return (
      <div className="p-6 text-center text-slate-400">
        Loading Timeline...
      </div>
    );

  if (!timeline.length)
    return (
      <div className="p-6 text-center text-slate-500">
        No Timeline Available
      </div>
    );

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 h-full overflow-y-auto">

      <h2 className="text-lg font-bold text-white mb-6">
        Incident Timeline
      </h2>

      <div className="relative">

        {/* LINE */}
        <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-slate-700" />

        {rendered}

        <div ref={bottomRef} />

      </div>

    </div>
  );
}