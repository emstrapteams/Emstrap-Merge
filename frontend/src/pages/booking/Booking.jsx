import { useState, useEffect, useRef, useCallback } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import { useAuth } from "../../context/AuthContext";
import LocationSearchInput from "../../components/map/LocationSearchInput";
import DriverHistory from "../ambulance/DriverHistory";
import toast from "react-hot-toast";

import {
  Truck,
  Navigation,
  CheckCircle2,
  Loader2,
  Activity,
  Wind,
  HeartPulse,
  Baby,
} from "lucide-react";

/* ---------------- SESSION HELPER ---------------- */
const session = {
  get: (key) => {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  clear: () => sessionStorage.clear(),
};

/* ---------------- AMBULANCE TYPES ---------------- */
const AMBULANCE_TYPES = [
  {
    id: "BASIC",
    label: "Basic Support",
    sublabel: "BLS",
    icon: Activity,
    baseRate: 100,
    minFare: 250,
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
    iconBgClass: "bg-blue-100 dark:bg-blue-900/40",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "OXYGEN",
    label: "Oxygen Support",
    sublabel: "O2",
    icon: Wind,
    baseRate: 150,
    minFare: 400,
    bgClass: "bg-cyan-50 dark:bg-cyan-900/20",
    iconBgClass: "bg-cyan-100 dark:bg-cyan-900/40",
    textClass: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "ICU",
    label: "ICU Support",
    sublabel: "ALS",
    icon: HeartPulse,
    baseRate: 250,
    minFare: 600,
    bgClass: "bg-violet-50 dark:bg-violet-900/20",
    iconBgClass: "bg-violet-100 dark:bg-violet-900/40",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "PREGNANT",
    label: "Pregnancy Care",
    sublabel: "OBS",
    icon: Baby,
    baseRate: 200,
    minFare: 500,
    bgClass: "bg-pink-50 dark:bg-pink-900/20",
    iconBgClass: "bg-pink-100 dark:bg-pink-900/40",
    textClass: "text-pink-600 dark:text-pink-400",
  },
];

/* ---------------- DEBOUNCE ---------------- */
const debounce = (fn, delay = 500) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isDriver =
    user?.role === "ambulance_driver" || user?.role === "ambulance";

  /* ---------------- DRIVER REDIRECT ---------------- */
  if (isDriver) {
    return <DriverHistory />;
  }

  /* ---------------- STATE ---------------- */
  const [pickup, setPickup] = useState(() => session.get("booking_pickup"));
  const [dropoff, setDropoff] = useState(() => session.get("booking_dropoff"));

  const [ambulanceType, setAmbulanceType] = useState(
    sessionStorage.getItem("booking_ambulanceType") || "BASIC"
  );

  const [distanceKm, setDistanceKm] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const bookingLock = useRef(false);

  /* ---------------- DISTANCE CALC (DEBOUNCED) ---------------- */
  const calculateDistance = useCallback(
    debounce((p, d) => {
      if (!p || !d) return;

      setIsCalculating(true);

      const R = 6371;
      const dLat = (d.lat - p.lat) * (Math.PI / 180);
      const dLng = (d.lng - p.lng) * (Math.PI / 180);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(p.lat * (Math.PI / 180)) *
          Math.cos(d.lat * (Math.PI / 180)) *
          Math.sin(dLng / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const km = R * c * 1.25; // road factor

      setDistanceKm(parseFloat(km.toFixed(2)));
      setIsCalculating(false);
    }, 500),
    []
  );

  /* ---------------- EFFECT: SESSION + DISTANCE ---------------- */
  useEffect(() => {
    session.set("booking_pickup", pickup);
    session.set("booking_dropoff", dropoff);
    sessionStorage.setItem("booking_ambulanceType", ambulanceType);

    calculateDistance(pickup, dropoff);
  }, [pickup, dropoff, ambulanceType, calculateDistance]);

  /* ---------------- PRICE ---------------- */
  const activeType =
    AMBULANCE_TYPES.find((t) => t.id === ambulanceType) || AMBULANCE_TYPES[0];

  const getPrice = (type = activeType) =>
    Math.max(type.baseRate * distanceKm, type.minFare);

  /* ---------------- BOOKING ---------------- */
  const handleBooking = async (e) => {
    e.preventDefault();

    if (bookingLock.current) return;
    bookingLock.current = true;

    try {
      if (!user) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      if (!pickup || !dropoff) {
        toast.error("Select pickup and drop location");
        return;
      }

      setLoading(true);

      const res = await API.post("/api/bookings", {
        pickupLocation: {
          address: pickup.address,
          latitude: pickup.lat,
          longitude: pickup.lng,
        },
        dropoffLocation: {
          address: dropoff.address,
          latitude: dropoff.lat,
          longitude: dropoff.lng,
        },
        ambulanceType,
        distanceKm,
      });

      toast.success("Ambulance booked successfully 🚑");

      session.clear();

      const id = res.data?.data?._id;
      navigate(id ? `/payment/${id}` : "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
      bookingLock.current = false;
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <Navbar />
      <Container>

        <div className="max-w-3xl mx-auto mt-10 mb-16">

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white">
              <Truck size={22} />
            </div>
            <div>
              <h2 className="text-3xl font-black">Book Ambulance</h2>
              <p className="text-sm text-gray-500">
                Fast emergency dispatch system
              </p>
            </div>
          </div>

          <form onSubmit={handleBooking} className="space-y-6">

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow space-y-6">

              {/* LOCATIONS */}
              <div className="grid md:grid-cols-2 gap-4">
                <LocationSearchInput
                  label="Pickup"
                  value={pickup}
                  onSelect={setPickup}
                />
                <LocationSearchInput
                  label="Dropoff"
                  value={dropoff}
                  onSelect={setDropoff}
                />
              </div>

              {/* DISTANCE */}
              <div className="flex justify-between bg-blue-50 p-3 rounded-xl">
                <span>
                  {isCalculating ? "Calculating..." : "Distance"}
                </span>
                <strong>
                  {distanceKm ? `${distanceKm} km` : "—"}
                </strong>
              </div>

              {/* AMBULANCE TYPES */}
              <div className="grid sm:grid-cols-2 gap-3">
                {AMBULANCE_TYPES.map((t) => {
                  const Icon = t.icon;
                  const selected = ambulanceType === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAmbulanceType(t.id)}
                      className={`p-4 rounded-xl border text-left ${
                        selected
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={18} />
                        <span className="font-bold">{t.label}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        ₹{getPrice(t).toFixed(0)}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* PRICE */}
              <div className="bg-red-600 text-white p-4 rounded-xl flex justify-between">
                <span>Total Fare</span>
                <strong>₹{getPrice().toFixed(0)}</strong>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-xl flex justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>

            </div>

          </form>

        </div>

      </Container>
    </>
  );
}