import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import { verifyEmailAPI } from "../../services/api";
import toast from "react-hot-toast";

const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState("Verifying your email...");

  /* ---------------- VERIFY FUNCTION ---------------- */
  const verifyEmail = useCallback(async () => {
    if (!token) {
      setStatus(STATUS.ERROR);
      setMessage("Invalid verification link");
      return;
    }

    try {
      setStatus(STATUS.LOADING);
      setMessage("Verifying your email...");

      const res = await verifyEmailAPI(token);

      setStatus(STATUS.SUCCESS);
      setMessage(res.message || "Email verified successfully");
      toast.success("Email verified!");
    } catch (error) {
      setStatus(STATUS.ERROR);

      const msg =
        error.response?.data?.message ||
        "Verification failed. Link may be expired or invalid.";

      setMessage(msg);
      toast.error(msg);
    }
  }, [token]);

  /* ---------------- RUN ON LOAD ---------------- */
  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  return (
    <>
      <Navbar />
      <Container>

        <div className="flex justify-center mt-12">

          <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center dark:border dark:border-gray-700">

            <h2 className="text-2xl font-bold mb-6">
              Email Verification
            </h2>

            {/* LOADING */}
            {status === STATUS.LOADING && (
              <div className="text-gray-500 mb-6">
                ⏳ {message}
              </div>
            )}

            {/* SUCCESS */}
            {status === STATUS.SUCCESS && (
              <div className="mb-6 text-green-600 font-medium">
                <div className="text-5xl mb-3">✅</div>
                {message}
              </div>
            )}

            {/* ERROR */}
            {status === STATUS.ERROR && (
              <div className="mb-6 text-red-600 font-medium">
                <div className="text-5xl mb-3">❌</div>
                {message}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="space-y-3">

              <button
                onClick={() => navigate("/login")}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl"
              >
                Go to Login
              </button>

              {/* Retry button only on error */}
              {status === STATUS.ERROR && (
                <button
                  onClick={verifyEmail}
                  className="w-full bg-gray-200 dark:bg-gray-700 py-3 rounded-xl"
                >
                  Try Again
                </button>
              )}

            </div>

          </div>
        </div>

      </Container>
    </>
  );
}