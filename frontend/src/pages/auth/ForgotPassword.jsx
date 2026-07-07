import { useState } from "react";
import { forgotPasswordAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import toast from "react-hot-toast";

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (status === STATUS.LOADING) return;

    setStatus(STATUS.LOADING);

    try {
      await forgotPasswordAPI(email);
      setStatus(STATUS.SUCCESS);
      toast.success("Reset link sent successfully");
    } catch (error) {
      setStatus(STATUS.IDLE);
      const message =
        error.response?.data?.message ||
        "Failed to send reset email. Please try again.";
      toast.error(message);
    }
  };

  const resendEmail = async () => {
    setStatus(STATUS.IDLE);
    await handleForgotPassword();
  };

  return (
    <>
      <Navbar />
      <Container>
        <div className="flex justify-center mt-12 mb-12">

          <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl transition-colors dark:border dark:border-gray-700">

            {/* SUCCESS STATE */}
            {status === STATUS.SUCCESS ? (
              <div className="flex flex-col items-center text-center py-6">

                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">📩</span>
                </div>

                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  Email Sent!
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Reset link sent to{" "}
                  <span className="font-semibold">{email}</span>
                </p>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl"
                >
                  Return to Login
                </button>

                <button
                  onClick={resendEmail}
                  className="mt-3 text-sm text-gray-500 hover:text-red-500"
                >
                  Resend email
                </button>

              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
                  Reset Password
                </h2>

                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                  Enter your email to receive reset instructions
                </p>

                <input
                  className="w-full border dark:border-gray-700 p-3.5 rounded-xl mb-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="name@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === STATUS.LOADING}
                  autoFocus
                />

                <button
                  onClick={handleForgotPassword}
                  disabled={status === STATUS.LOADING}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl disabled:opacity-70"
                >
                  {status === STATUS.LOADING ? "Sending..." : "Send Reset Link"}
                </button>

                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
                  Remember password?{" "}
                  <span
                    className="text-red-500 cursor-pointer font-semibold"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </span>
                </p>
              </>
            )}

          </div>
        </div>
      </Container>
    </>
  );
}