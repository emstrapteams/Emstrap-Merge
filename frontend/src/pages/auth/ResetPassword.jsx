import { useState } from "react";
import { resetPasswordAPI } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import toast from "react-hot-toast";

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
};

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(password);

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const { token } = useParams();

  const handleResetPassword = async () => {
    if (status === STATUS.LOADING) return;

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isStrongPassword(password)) {
      toast.error(
        "Password must include uppercase, lowercase, number, and special character"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setStatus(STATUS.LOADING);

    try {
      await resetPasswordAPI(token, password);
      setStatus(STATUS.SUCCESS);
      toast.success("Password reset successful!");
    } catch (error) {
      setStatus(STATUS.IDLE);

      const message =
        error.response?.data?.message ||
        "Invalid or expired reset link";

      toast.error(message);
    }
  };

  return (
    <>
      <Navbar />
      <Container>

        <div className="flex justify-center mt-12 mb-12">

          <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">

            {/* SUCCESS STATE */}
            {status === STATUS.SUCCESS ? (
              <div className="text-center py-6">

                <div className="text-5xl mb-4">🔐</div>

                <h2 className="text-2xl font-bold mb-3">
                  Password Updated
                </h2>

                <p className="text-gray-500 mb-6">
                  You can now log in with your new password
                </p>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-red-600 text-white py-3 rounded-xl"
                >
                  Go to Login
                </button>

              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-center mb-4">
                  Create New Password
                </h2>

                <p className="text-center text-gray-500 mb-8">
                  Use a strong password for better security
                </p>

                {/* PASSWORD */}
                <div className="relative mb-4">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={status === STATUS.LOADING}
                    className="w-full border p-3.5 rounded-xl pr-12 bg-gray-50 dark:bg-gray-900"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>

                </div>

                {/* CONFIRM PASSWORD */}
                <div className="relative mb-6">

                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={status === STATUS.LOADING}
                    className="w-full border p-3.5 rounded-xl pr-12 bg-gray-50 dark:bg-gray-900"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>

                </div>

                {/* BUTTON */}
                <button
                  onClick={handleResetPassword}
                  disabled={status === STATUS.LOADING}
                  className="w-full bg-red-600 text-white py-3.5 rounded-xl disabled:opacity-70"
                >
                  {status === STATUS.LOADING
                    ? "Updating..."
                    : "Reset Password"}
                </button>

              </>
            )}

          </div>
        </div>

      </Container>
    </>
  );
}