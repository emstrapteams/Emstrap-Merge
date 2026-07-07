import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import { getErrorMessage, loginAPI } from "../../services/api";
import toast from "react-hot-toast";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { loginUser, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  /* ---------------- REDIRECT ---------------- */
  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, authLoading, navigate]);

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const data = await loginAPI({
        email: email.trim().toLowerCase(),
        password,
      });

      loginUser(data);
      toast.success(data.message || "Login successful!");

      const role = data.user?.role || data.role;

      navigate(role === "admin" ? "/admin" : "/dashboard");

    } catch (error) {
      toast.error(
        getErrorMessage(error, "Login failed. Please check credentials.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container>

        <div className="flex justify-center mt-12 mb-12">

          <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">

            {/* TITLE */}
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              Welcome Back
            </h2>

            {/* FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >

              {/* EMAIL */}
              <input
                className="w-full border dark:border-gray-700 p-3.5 rounded-xl mb-4 bg-gray-50 dark:bg-gray-900"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              {/* PASSWORD */}
              <div className="relative mb-4">

                <input
                  className="w-full border dark:border-gray-700 p-3.5 pr-12 rounded-xl bg-gray-50 dark:bg-gray-900"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

              {/* FORGOT PASSWORD */}
              <div className="flex justify-end mb-6">
                <span
                  className="text-sm text-red-500 cursor-pointer"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </span>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>

            {/* REGISTER */}
            <p className="text-sm mt-6 text-center text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <span
                className="text-red-500 cursor-pointer font-semibold"
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </p>

          </div>
        </div>

      </Container>
    </>
  );
}