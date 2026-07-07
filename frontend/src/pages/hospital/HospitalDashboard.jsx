import { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import StatCard from "./StatCard";
import AlertsPanel from "./AlertsPanel";
import EmergencyQueue from "./EmergencyQueue";
import IncomingAmbulances from "./IncomingAmbulances";
import BedAvailability from "./BedAvailability";
import HospitalCharts from "./HospitalCharts";
import HospitalTimeline from "./HospitalTimeline";
import TrackingMap from "../../components/map/TrackingMap";
import API from "../../services/api";

export default function HospitalDashboard() {
  const [socketConnected, setSocketConnected] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [beds, setBeds] = useState({
    total: 0,
    available: 0,
    icu: 0,
  });

  const [userLocation] = useState({
    lat: 28.61,
    lng: 77.2,
  });

  const [ambulanceLocations, setAmbulanceLocations] = useState([]);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await API.get("/hospital/dashboard");

      setAlerts(res.data.alerts || []);
      setEmergencies(res.data.emergencies || []);
      setAmbulances(res.data.ambulances || []);
      setBeds(res.data.beds || beds);

      setAmbulanceLocations(
        (res.data.ambulances || []).map((a) => ({
          id: a._id,
          lat: a.location?.lat,
          lng: a.location?.lng,
        }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- GOOGLE MAP NAVIGATION ---------------- */
  const openGoogleMaps = (ambulance) => {
    const lat = ambulance?.location?.lat;
    const lng = ambulance?.location?.lng;

    if (!lat || !lng) {
      alert("Location not available for navigation");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  /* ---------------- AMBULANCE ACTION HANDLERS ---------------- */
  const handleViewMap = (ambulance) => {
    const lat = ambulance?.location?.lat;
    const lng = ambulance?.location?.lng;

    if (!lat || !lng) return;

    setAmbulanceLocations([
      {
        id: ambulance._id,
        lat,
        lng,
      },
    ]);
  };

  const handleCallDriver = (ambulance) => {
    const phone = ambulance?.driverPhone;
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="p-4 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* HEADER */}
      <DashboardHeader
        hospitalName="EMSTRAP Hospital"
        totalAlerts={alerts.length}
        socketConnected={socketConnected}
        systemTime={new Date().toLocaleTimeString()}
        onRefresh={loadDashboard}
      />

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Beds" value={beds.total} icon="beds" color="blue" />
        <StatCard title="Available Beds" value={beds.available} icon="bed" color="green" />
        <StatCard title="ICU Beds" value={beds.icu} icon="icu" color="purple" />
        <StatCard title="Active Emergencies" value={emergencies.length} icon="emergency" color="red" />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* LIVE MAP */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4">
            <h2 className="font-bold mb-3 flex items-center justify-between">
              Live Ambulance Tracking

              {/* GLOBAL NAV BUTTON (FIRST AMBULANCE) */}
              {ambulances[0] && (
                <button
                  onClick={() => openGoogleMaps(ambulances[0])}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Navigate (Google Maps)
                </button>
              )}
            </h2>

            <div className="h-[500px] rounded-xl overflow-hidden">
              <TrackingMap
                userLocation={userLocation}
                driverLocation={ambulanceLocations[0] || null}
                multiMarkers={ambulanceLocations}
              />
            </div>
          </div>

          {/* QUEUE + AMBULANCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EmergencyQueue data={emergencies} />

            <IncomingAmbulances
              ambulances={ambulances}
              onAccept={(a) => console.log("Accepted", a)}
              onReject={(id) => console.log("Rejected", id)}
            />
          </div>

          {/* CHARTS */}
          <HospitalCharts stats={{
            emergency: emergencies.length,
            admitted: 46,
            discharged: 31,
            ambulances: ambulances.length,
            occupancy: beds.total ? (beds.total - beds.available) : 0,
            icu: beds.icu || 0,
          }} />

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <AlertsPanel alerts={alerts} />

          <BedAvailability beds={beds} />

          <HospitalTimeline emergencies={emergencies} />

        </div>
      </div>
    </div>
  );
}