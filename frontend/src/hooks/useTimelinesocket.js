import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../services/api";

export default function useTimelineSocket(incidentId, setTimeline) {
  const socketRef = useRef(null);
  const seenEvents = useRef(new Set());

  useEffect(() => {
    if (!incidentId) return;

    // 🚑 prevent multiple sockets (VERY IMPORTANT)
    if (!socketRef.current) {
      socketRef.current = io(API_URL, {
        transports: ["websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20000,
      });
    }

    const socket = socketRef.current;

    const handleConnect = () => {
      console.log("🟢 Timeline Socket Connected");

      socket.emit("join-incident-room", {
        incidentId,
      });
    };

    const handleNew = (event) => {
      if (!event?._id) return;

      // 🚑 dedupe safety (critical for EMS systems)
      if (seenEvents.current.has(event._id)) return;
      seenEvents.current.add(event._id);

      setTimeline((prev) => {
        const exists = prev.some((i) => i._id === event._id);
        if (exists) return prev;

        return [event, ...prev];
      });
    };

    const handleUpdate = (event) => {
      if (!event?._id) return;

      setTimeline((prev) =>
        prev.map((item) =>
          item._id === event._id ? event : item
        )
      );
    };

    const handleDelete = ({ eventId }) => {
      if (!eventId) return;

      seenEvents.current.delete(eventId);

      setTimeline((prev) =>
        prev.filter((item) => item._id !== eventId)
      );
    };

    const handleDisconnect = (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    };

    const handleError = (err) => {
      console.error("❌ Socket error:", err.message);
    };

    // 🚑 attach listeners (stable refs)
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    socket.on("timeline:new", handleNew);
    socket.on("timeline:update", handleUpdate);
    socket.on("timeline:delete", handleDelete);

    return () => {
      socket.emit("leave-incident-room", {
        incidentId,
      });

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);

      socket.off("timeline:new", handleNew);
      socket.off("timeline:update", handleUpdate);
      socket.off("timeline:delete", handleDelete);

      socketRef.current = null;
    };
  }, [incidentId, setTimeline]);

  return socketRef;
}