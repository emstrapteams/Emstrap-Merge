import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import LiveTrackingMap from "../../components/map/LiveTrackingMap";
import TrackingInfoCard from "../../components/map/TrackingInfoCard";

import API from "../../services/api";
import socket from "../../socket";

const STATUS_TEXT = {
  PENDING: "Searching for nearby ambulance...",
  AMBULANCE_ACCEPTED: "Driver is on the way",
  ARRIVED_AT_LOCATION: "Driver has arrived",
  EN_ROUTE_TO_HOSPITAL: "Heading to hospital",
  COMPLETED: "Emergency completed",
};

export default function Tracking() {
  const { requestId } = useParams();

  const [loading, setLoading] = useState(true);

  const [tracking, setTracking] = useState({
    userLocation: null,
    driverLocation: null,
    driverName: "Searching...",
    status: "PENDING",
    eta: "--",
    distance: "--",
  });

  const loadTracking = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get(`/emergency/${requestId}`);
      const request = res.data.data || res.data;

      const driverLocation =
        request.driver?.currentLocation ||
        request.ambulance?.currentLocation;

      setTracking((prev) => ({
        ...prev,
        userLocation: request.location
          ? {
              lat: request.location.latitude,
              lng: request.location.longitude,
            }
          : null,

        driverLocation: driverLocation
          ? {
              lat: driverLocation.latitude,
              lng: driverLocation.longitude,
            }
          : null,

        driverName:
          request.driver?.name ||
          request.ambulance?.driverName ||
          request.ambulance?.name ||
          "Searching...",

        status: request.status || "PENDING",
      }));
    } catch (err) {
      console.error("Tracking Error:", err);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadTracking();

    socket.emit("track_request", { requestId });

    const handleLocation = (data) => {
      if (data.requestId !== requestId) return;

      const lat = data.lat ?? data.latitude ?? data.location?.latitude;
      const lng = data.lng ?? data.longitude ?? data.location?.longitude;

      if (!lat || !lng) return;

      setTracking((prev) => ({
        ...prev,
        driverLocation: { lat, lng },
      }));
    };

    const handleStatus = (status, driverName = null) => {
      setTracking((prev) => ({
        ...prev,
        status,
        driverName: driverName || prev.driverName,
      }));
    };

    socket.on("ambulance_location", handleLocation);

    socket.on("ambulance_assigned", (data) => {
      if (data.requestId !== requestId) return;

      setTracking((prev) => ({
        ...prev,
        status: "AMBULANCE_ACCEPTED",
        driverName: data.driverName || prev.driverName,
        driverLocation: data.location
          ? {
              lat: data.location.latitude,
              lng: data.location.longitude,
            }
          : prev.driverLocation,
      }));
    });

    socket.on("driver_arrived", () => handleStatus("ARRIVED_AT_LOCATION"));

    socket.on("hospital_assigned", () =>
      handleStatus("EN_ROUTE_TO_HOSPITAL")
    );

    socket.on("trip_completed", () => handleStatus("COMPLETED"));

    socket.on("request_status_updated", (data) => {
      if (data.requestId !== requestId) return;

      setTracking((prev) => ({
        ...prev,
        status: data.status,
      }));
    });

    return () => {
      socket.emit("stop_tracking", { requestId });

      socket.off("ambulance_location", handleLocation);
      socket.off("ambulance_assigned");
      socket.off("driver_arrived");
      socket.off("hospital_assigned");
      socket.off("trip_completed");
      socket.off("request_status_updated");
    };
  }, [requestId, loadTracking]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="flex items-center justify-center h-[70vh]">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <Container>
        <div className="space-y-6 py-6">

          <LiveTrackingMap
            userLocation={tracking.userLocation}
            driverLocation={tracking.driverLocation}
            height="550px"
            onRouteUpdate={({ eta, distance }) =>
              setTracking((prev) => ({
                ...prev,
                eta: eta != null ? `${eta} mins` : "--",
                distance: distance != null ? `${distance} km` : "--",
              }))
            }
          />

          <TrackingInfoCard
            dashboardType="user"
            driverName={tracking.driverName}
            eta={tracking.eta}
            distance={tracking.distance}
            status={tracking.status}
            userLocation={tracking.userLocation}
            driverLocation={tracking.driverLocation}
          />

        </div>
      </Container>
    </>
  );
}