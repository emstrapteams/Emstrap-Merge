import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/logo.png";
import {
  LayoutDashboard,
  Map,
  Bell,
  LogOut,
  Menu,
  Settings,
  User,
  Moon,
  Sun,
  Siren,
  CalendarPlus,
  Users,
} from "lucide-react";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [profileImage, setProfileImage] = useState(null);

  const isLoggedIn = !!user;

  /* ---------------- PROFILE IMAGE SYNC ---------------- */
  useEffect(() => {
    if (!user?._id) {
      setProfileImage(null);
      return;
    }

    const img = localStorage.getItem(`profileImage_${user._id}`);
    setProfileImage(img || null);
  }, [user?._id]);

  /* ---------------- THEME SYNC ---------------- */
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  /* ---------------- PROFILE IMAGE ---------------- */
  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setProfileImage(dataUrl);
      localStorage.setItem(`profileImage_${user._id}`, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const triggerImagePicker = (e) => {
    e.stopPropagation();
    document.getElementById("navbar-profile-image-input")?.click();
  };

  const removeProfileImage = (e) => {
    e.stopPropagation();
    setProfileImage(null);
    if (user?._id) {
      localStorage.removeItem(`profileImage_${user._id}`);
    }
  };

  /* ---------------- ROLES ---------------- */
  const role = user?.role;

  const isPolice = role === "police" || role === "police_hq";
  const isHospital = role === "hospital" || role === "hospital_admin";
  const isAmbulance = role === "ambulance" || role === "ambulance_driver";

  /* ---------------- NAV STYLE ---------------- */
  const navLinkClasses = (active) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      active
        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600"
    }`;

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav className="fixed top-0 inset-x-0 bg-white dark:bg-gray-900 shadow-md z-[1000]">
        <div className="px-4">
          <div className="flex justify-between h-16 items-center">

            {/* LEFT */}
            <div className="flex items-center gap-3">
              {isAmbulance && (
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() =>
                    document.dispatchEvent(
                      new CustomEvent("toggle-ambulance-sidebar")
                    )
                  }
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}

              <Link to="/" className="flex items-center">
                <img src={logo} alt="Logo" className="h-12 object-contain" />
              </Link>
            </div>

            {/* CENTER NAV */}
            <div className="hidden sm:flex items-center gap-2">
              {isPolice && (
                <>
                  <Link to="/police" className={navLinkClasses(location.pathname === "/police")}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/police/map" className={navLinkClasses(location.pathname.startsWith("/police/map"))}>
                    <Map className="w-5 h-5" />
                    <span>Live Map</span>
                  </Link>
                  <Link to="/police/settings" className={navLinkClasses(location.pathname.startsWith("/police/settings"))}>
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </>
              )}

              {isHospital && (
                <>
                  <Link to="/hospital" className={navLinkClasses(location.pathname === "/hospital")}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/hospital/patients" className={navLinkClasses(location.pathname.startsWith("/hospital/patients"))}>
                    <Users className="w-5 h-5" />
                    <span>Patient Records</span>
                  </Link>
                  <Link to="/hospital/map" className={navLinkClasses(location.pathname.startsWith("/hospital/map"))}>
                    <Map className="w-5 h-5" />
                    <span>Live Map</span>
                  </Link>
                  <Link to="/hospital/settings" className={navLinkClasses(location.pathname.startsWith("/hospital/settings"))}>
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </>
              )}

              {!isPolice && !isHospital && (
                <>
                  {(!user || role === "user") && (
                    <Link to="/" className={navLinkClasses(location.pathname === "/")}>
                      <Siren className="w-5 h-5" />
                      <span>Emergency</span>
                    </Link>
                  )}

                  {role === "user" && (
                    <>
                      <Link to="/dashboard" className={navLinkClasses(location.pathname === "/dashboard")}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                      </Link>

                      <Link to="/booking" className={navLinkClasses(location.pathname === "/booking")}>
                        <CalendarPlus className="w-5 h-5" />
                        <span>Booking</span>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">

              {isLoggedIn && (
                <button className="relative p-2">
                  <Bell className="w-6 h-6 text-gray-500" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              )}

              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="bg-red-600 text-white px-5 py-2 rounded-full"
                >
                  Login
                </Link>
              ) : (
                <div className="relative">

                  <input
                    id="navbar-profile-image-input"
                    type="file"
                    hidden
                    onChange={handleProfileImageChange}
                  />

                  <button
                    onClick={() => setDropdownOpen((p) => !p)}
                    className="w-10 h-10 rounded-full overflow-hidden bg-red-600 text-white flex items-center justify-center"
                  >
                    {profileImage ? (
                      <img src={profileImage} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-2">

                      <button
                        onClick={() => navigate("/profile")}
                        className="flex gap-2 w-full p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <User className="w-4 h-4" /> Profile
                      </button>

                      <button
                        onClick={toggleTheme}
                        className="flex gap-2 w-full p-2 hover:bg-gray-100 rounded-lg"
                      >
                        {theme === "light" ? (
                          <>
                            <Moon className="w-4 h-4" /> Dark
                          </>
                        ) : (
                          <>
                            <Sun className="w-4 h-4" /> Light
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex gap-2 w-full p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      </nav>

      <div className="h-16" />
    </>
  );
}