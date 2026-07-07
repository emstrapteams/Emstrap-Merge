import { useState } from "react";
import { registerAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import toast from "react-hot-toast";

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
};

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidMobile = (mobile) =>
  /^[6-9]\d{9}$/.test(mobile);

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

const isValidVehicle = (v) =>
  /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{3,4}$/.test(v);

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    city: "",
    address: "",
    role: "",
    vehicleNumber: "",
  });

  const [status, setStatus] = useState(STATUS.IDLE);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    if (!form.name) return "Name is required";
    if (!isValidEmail(form.email)) return "Invalid email address";
    if (!isValidMobile(form.mobile)) return "Invalid mobile number";
    if (!isStrongPassword(form.password)) return "Weak password";
    if (!form.role) return "Please select a role";

    if (form.role === "ambulance_driver" && !isValidVehicle(form.vehicleNumber)) {
      return "Invalid vehicle number format (e.g. MH-12-AB-1234)";
    }

    return null;
  };

  /* ---------------- REGISTER ---------------- */
  const handleRegister = async () => {
    if (status === STATUS.LOADING) return;

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setStatus(STATUS.LOADING);

    try {
      await registerAPI(form);
      setStatus(STATUS.SUCCESS);
      toast.success("Account created successfully");
    } catch (err) {
      setStatus(STATUS.IDLE);
      toast.error(
        err.response?.data?.message || "Registration failed"
      );
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

                <div className="text-4xl mb-4">🎉</div>

                <h2 className="text-2xl font-bold mb-3">
                  Account Created
                </h2>

                <p className="text-gray-500 mb-6">
                  Please verify your email before login
                </p>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-red-600 text-white py-3 rounded-xl"
                >
                  Go to Login
                </button>

              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRegister();
                }}
              >

                <h2 className="text-3xl font-bold text-center mb-8">
                  Create Account
                </h2>

                {/* NAME */}
                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={status === STATUS.LOADING}
                  className="input"
                />

                {/* EMAIL */}
                <input
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={status === STATUS.LOADING}
                  className="input"
                />

                {/* MOBILE */}
                <input
                  name="mobile"
                  placeholder="Mobile"
                  value={form.mobile}
                  maxLength={10}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mobile: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  disabled={status === STATUS.LOADING}
                  className="input"
                />

                {/* PASSWORD */}
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={status === STATUS.LOADING}
                  className="input"
                />

                {/* ROLE */}
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={status === STATUS.LOADING}
                  className="input mb-4"
                >
                  <option value="">Select Role</option>
                  <option value="user">User</option>
                  <option value="ambulance_driver">Ambulance Driver</option>
                </select>

                {/* VEHICLE */}
                {form.role === "ambulance_driver" && (
                  <input
                    name="vehicleNumber"
                    placeholder="Vehicle Number"
                    value={form.vehicleNumber}
                    onChange={handleChange}
                    className="input mb-6"
                  />
                )}

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={status === STATUS.LOADING}
                  className="w-full bg-red-600 text-white py-3 rounded-xl"
                >
                  {status === STATUS.LOADING
                    ? "Creating..."
                    : "Register"}
                </button>

                <p className="text-center text-sm mt-5">
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-red-500 cursor-pointer font-semibold"
                  >
                    Login
                  </span>
                </p>

              </form>
            )}

          </div>
        </div>

      </Container>
    </>
  );
}