import { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import BookingCard from "../../components/user/BookingCard";
import StatCard from "../../components/user/StatCard";
import QuickStats from "../../components/user/QuickStats";
import CurrentBookingCard from "../../components/user/CurrentBookingCard";
import BookingTimeline from "../../components/user/BookingTimeline";
import LiveMap from "../../components/user/LiveMap";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("total");
  const [currentPage, setCurrentPage] = useState(1);

  const [currentBooking, setCurrentBooking] = useState(null);

  const limit = 5;

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    emergency: 0,
    cancelled: 0,
  });

  /* ---------------- FETCH BOOKINGS ---------------- */
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await API.get("/booking/my-bookings");
      const data = res.data || [];

      setBookings(data);

      setStats({
        total: data.length,
        completed: data.filter((b) => b.status === "COMPLETED").length,
        emergency: data.filter((b) => b.isEmergency).length,
        cancelled: data.filter((b) => b.status === "CANCELLED").length,
      });

      // 🔥 FIND ACTIVE BOOKING (LIVE TRACKING)
      const active = data.find(
        (b) =>
          b.status === "PENDING" ||
          b.status === "AMBULANCE_ACCEPTED" ||
          b.status === "ON_THE_WAY"
      );

      setCurrentBooking(active || null);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ---------------- CANCEL BOOKING ---------------- */
  const handleCancel = async (id) => {
    try {
      await API.post(`/booking/cancel/${id}`);
      toast.success("Booking cancelled");
      fetchBookings();
    } catch {
      toast.error("Cancel failed");
    }
  };

  /* ---------------- FILTER ---------------- */
  const filtered = bookings.filter((b) => {
    if (activeFilter === "total") return true;
    if (activeFilter === "completed") return b.status === "COMPLETED";
    if (activeFilter === "emergency") return b.isEmergency;
    if (activeFilter === "cancelled") return b.status === "CANCELLED";
  });

  const paginated = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  if (loading)
    return <div className="p-10 text-gray-500">Loading dashboard...</div>;

  return (
    <>
      <Navbar />

      <Container>
        <div className="pt-6 space-y-6">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">User Dashboard</h1>

            <Link
              to="/booking"
              className="bg-red-600 text-white px-4 py-2 rounded-xl"
            >
              🚨 New Emergency
            </Link>
          </div>

          {/* QUICK STATS (NEW UPGRADE) */}
          <QuickStats stats={stats} />

          {/* CURRENT LIVE BOOKING */}
          {currentBooking && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <CurrentBookingCard
                booking={currentBooking}
                onCancel={handleCancel}
                onTrack={(b) =>
                  navigate(`/tracking/${b._id}`)
                }
                onOpenMaps={(b) => {
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${b.pickupLocation.lat},${b.pickupLocation.lng}&destination=${b.dropLocation.lat},${b.dropLocation.lng}&travelmode=driving`;
                  window.open(url, "_blank");
                }}
                onCallDriver={(phone) =>
                  window.open(`tel:${phone}`)
                }
              />

              {/* LIVE MAP */}
              <LiveMap
                pickup={{
                  lat: currentBooking?.pickupLocation?.lat,
                  lng: currentBooking?.pickupLocation?.lng,
                }}
                ambulance={{
                  lat: currentBooking?.ambulanceLocation?.lat,
                  lng: currentBooking?.ambulanceLocation?.lng,
                }}
                hospital={{
                  lat: currentBooking?.hospitalLocation?.lat,
                  lng: currentBooking?.hospitalLocation?.lng,
                }}
              />
            </div>
          )}

          {/* TIMELINE */}
          {currentBooking && (
            <BookingTimeline status={currentBooking.status} />
          )}

          {/* FILTER BUTTONS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total"
              value={stats.total}
              onClick={() => setActiveFilter("total")}
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              onClick={() => setActiveFilter("completed")}
            />
            <StatCard
              label="Emergency"
              value={stats.emergency}
              onClick={() => setActiveFilter("emergency")}
            />
            <StatCard
              label="Cancelled"
              value={stats.cancelled}
              onClick={() => setActiveFilter("cancelled")}
            />
          </div>

          {/* BOOKING LIST */}
          <div className="space-y-4">
            {paginated.map((booking) => (
              <div
                key={booking._id}
                className="border p-3 rounded-xl bg-white dark:bg-gray-900"
              >
                <BookingCard
                  booking={booking}
                  onCancel={handleCancel}
                />

                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${booking.pickupLocation.lat},${booking.pickupLocation.lng}&destination=${booking.dropLocation.lat},${booking.dropLocation.lng}&travelmode=driving`;
                    window.open(url, "_blank");
                  }}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Open Route in Google Maps
                </button>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </>
  );
}