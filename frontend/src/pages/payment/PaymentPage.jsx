import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import toast from "react-hot-toast";

import {
  getBookingByIdAPI,
  getPaymentStatusAPI,
  createPaymentIntentAPI,
  verifyPaymentAPI,
} from "../../services/api";

import {
  CreditCard,
  Wallet,
  Smartphone,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  Navigation,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Wind,
  HeartPulse,
  Baby,
  Siren,
} from "lucide-react";

/* ────────────────────────────────
  AMBULANCE META
──────────────────────────────── */
const AMBULANCE_TYPE_META = {
  BASIC: { label: "Basic Support", icon: Activity },
  OXYGEN: { label: "Oxygen Support", icon: Wind },
  ICU: { label: "ICU Care", icon: HeartPulse },
  PREGNANT: { label: "Pregnancy Care", icon: Baby },
  EMERGENCY: { label: "Emergency", icon: Siren },
};

const PAYMENT_METHODS = [
  { id: "CASH", label: "Cash", icon: Wallet },
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "UPI", label: "UPI", icon: Smartphone },
];

/* ────────────────────────────────
  COMPONENT
──────────────────────────────── */
export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [success, setSuccess] = useState(null);

  /* ────────────────────────────────
    LOAD DATA
  ──────────────────────────────── */
  useEffect(() => {
    if (!bookingId) return;

    let alive = true;

    const load = async () => {
      setLoading(true);

      try {
        const [b, p] = await Promise.allSettled([
          getBookingByIdAPI(bookingId),
          getPaymentStatusAPI(bookingId),
        ]);

        if (!alive) return;

        if (b.status === "fulfilled" && b.value?.success) {
          setBooking(b.value.data);
        }

        if (p.status === "fulfilled" && p.value?.success) {
          setPayment(p.value.data);
        }
      } catch {
        toast.error("Failed to load payment data");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [bookingId]);

  /* ────────────────────────────────
    DERIVED DATA
  ──────────────────────────────── */
  const typeMeta = useMemo(() => {
    return (
      AMBULANCE_TYPE_META[booking?.ambulanceType] ||
      AMBULANCE_TYPE_META.BASIC
    );
  }, [booking]);

  const TypeIcon = typeMeta.icon;

  const amountDue = useMemo(() => {
    return payment?.amount ?? booking?.estimatedPrice ?? 0;
  }, [payment, booking]);

  const isPaid = payment?.status === "COMPLETED";

  /* ────────────────────────────────
    PAYMENT FLOW (RAZORPAY READY)
  ──────────────────────────────── */
  const handlePay = useCallback(async () => {
    if (!bookingId || processing || isPaid) return;

    setProcessing(true);

    try {
      // STEP 1: create payment intent
      const intent = await createPaymentIntentAPI(bookingId);

      if (!intent?.success) {
        toast.error("Unable to initiate payment");
        return;
      }

      const data = intent.data;

      // STEP 2: Razorpay integration (frontend)
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount * 100,
        currency: "INR",
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          try {
            // STEP 3: verify payment
            const verify = await verifyPaymentAPI({
              bookingId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              method: selectedMethod,
            });

            if (verify?.success) {
              setPayment(verify.data);
              setSuccess(verify.data);
              toast.success("Payment successful");
            } else {
              toast.error("Verification failed");
            }
          } catch {
            toast.error("Payment verification error");
          }
        },

        theme: { color: "#4f46e5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Payment failed to start");
    } finally {
      setProcessing(false);
    }
  }, [bookingId, processing, isPaid, selectedMethod]);

  /* ────────────────────────────────
    AUTO REDIRECT AFTER SUCCESS
  ──────────────────────────────── */
  useEffect(() => {
    if (!success) return;

    const t = setTimeout(() => {
      navigate(`/tracking/${bookingId}`);
    }, 2500);

    return () => clearTimeout(t);
  }, [success, bookingId, navigate]);

  /* ────────────────────────────────
    LOADING
  ──────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <Container>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-indigo-500" />
            <p className="text-sm text-gray-500 mt-3">
              Loading payment...
            </p>
          </div>
        </Container>
      </div>
    );
  }

  /* ────────────────────────────────
    NOT FOUND
  ──────────────────────────────── */
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <Container>
          <div className="text-center py-20">
            <AlertTriangle className="mx-auto text-gray-400" />
            <p className="mt-3 font-semibold">Booking not found</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 text-indigo-600 font-bold"
            >
              Go back
            </button>
          </div>
        </Container>
      </div>
    );
  }

  /* ────────────────────────────────
    SUCCESS SCREEN
  ──────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <Container>
          <div className="max-w-md mx-auto mt-10 text-center">
            <CheckCircle2 className="text-green-500 mx-auto" size={48} />

            <h1 className="text-xl font-bold mt-3">
              Payment Successful
            </h1>

            <div className="mt-6 bg-white dark:bg-gray-900 p-5 rounded-xl">
              <p className="text-xs text-gray-500">Transaction ID</p>
              <p className="font-mono font-bold">
                {success.transactionId}
              </p>

              <p className="text-xs text-gray-500 mt-3">
                Amount Paid
              </p>
              <p className="text-xl font-black text-green-600">
                ₹{success.amount}
              </p>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Redirecting to tracking...
            </p>
          </div>
        </Container>
      </div>
    );
  }

  /* ────────────────────────────────
    MAIN UI
  ──────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Container>
        <div className="max-w-lg mx-auto mt-8 mb-16">

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm mb-5"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <h1 className="text-2xl font-black mb-6">
            Complete Payment
          </h1>

          {/* AMOUNT */}
          <div className="bg-indigo-600 text-white p-5 rounded-xl mb-6">
            <p className="text-xs opacity-70">Amount Due</p>
            <p className="text-3xl font-black">₹{amountDue}</p>
          </div>

          {/* BOOKING */}
          <div className="mb-6 text-sm space-y-2">
            <div className="flex gap-2 items-start">
              <MapPin size={14} />
              <p>{booking.pickupLocation?.address}</p>
            </div>
            <div className="flex gap-2 items-start">
              <Navigation size={14} />
              <p>{booking.dropoffLocation?.address}</p>
            </div>
          </div>

          {/* PAYMENT OPTIONS */}
          {!isPaid ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon;
                  const active = selectedMethod === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`p-3 rounded-xl border ${
                        active
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Icon className="mx-auto" />
                      <p className="text-xs mt-2">{m.label}</p>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex justify-center"
              >
                {processing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `Pay ₹${amountDue}`
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <ShieldCheck className="text-green-600" />
              <p className="font-semibold">Already Paid</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}