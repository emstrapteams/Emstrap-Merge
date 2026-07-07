import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ClipboardList,
  LogOut,
  Menu,
  Moon,
  Shield,
  Siren,
  Sun,
  Truck,
  User,
  Users,
  X,
  Radio,
} from "lucide-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

const USER_SUB_ITEMS = [
  { name: "Emergencies", path: "/admin/emergencies", icon: Siren },
  { name: "Bookings", path: "/admin/bookings", icon: ClipboardList },
  { name: "Hospitals", path: "/admin/hospitals", icon: Building2 },
  { name: "Ambulance", path: "/admin/ambulance", icon: Truck },
  { name: "Police", path: "/admin/police", icon: Shield },
];

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB Limit
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function AdminLayout({ title, description, actions, children }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [profileImage, setProfileImage] = useState(null);

  // --- Live Socket & Alert States ---
  const [socket, setSocket] = useState(null);
  const [liveAlertsCount, setLiveAlertsCount] = useState(0);

  const usersMenuRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Real-time socket coordination engine
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      // Register client room as an authorized system supervisor
      socketInstance.emit("join_admin", { adminId: user?._id });
    });

    // Real-time dispatch listeners
    socketInstance.on("hospital_alert", (data) => {
      setLiveAlertsCount((prev) => prev + 1);
      toast.error(`⚠️ EMERGENCY: New Hospital Dispatch Request Received!`, { duration: 5000 });
    });

    socketInstance.on("police_new_case", (data) => {
      setLiveAlertsCount((prev) => prev + 1);
      toast.error(`🛡️ POLICE ALERT: High-priority incident reported!`, { duration: 5000 });
    });

    socketInstance.on("ambulance_incident_update", (data) => {
      toast.success(`🚑 Dispatch Update: Ambulance status changed.`, { icon: "🚨" });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user?._id]);

  // Sync profile picture when swapping admin accounts
  useEffect(() => {
    if (user?._id) {
      setProfileImage(localStorage.getItem(`profileImage_${user._id}`) || null);
    } else {
      setProfileImage(null);
    }
  }, [user?._id]);

  // Handle Tailwind HTML dark mode toggle
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Combined listener for Outside Clicks and Escape Key overlay closing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (usersMenuRef.current && !usersMenuRef.current.contains(event.target)) {
        setUsersMenuOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setUsersMenuOpen(false);
        setMobileNavOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Collapse navigation overlays on page transition
  useEffect(() => {
    setMobileNavOpen(false);
    setUsersMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate uploaded image explicitly with robust target clears
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only PNG, JPG, and WEBP images are allowed.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image is too large. Maximum size allowed is 2MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setProfileImage(dataUrl);
      if (user?._id) {
        localStorage.setItem(`profileImage_${user._id}`, dataUrl);
      }
      event.target.value = "";
      toast.success("Profile avatar updated successfully!");
    };
    reader.readAsDataURL(file);
  };

  const triggerImagePicker = (event) => {
    event.stopPropagation();
    fileInputRef.current?.click();
  };

  const removeProfileImage = (event) => {
    event.stopPropagation();
    setProfileImage(null);
    if (user?._id) {
      localStorage.removeItem(`profileImage_${user._id}`);
    }
    toast.success("Profile avatar removed.");
  };

  const handleLogout = useCallback(() => {
    logoutUser();
    navigate("/login");
    toast.success("Logged out successfully.");
  }, [logoutUser, navigate]);

  const clearAlertBadge = () => {
    setLiveAlertsCount(0);
    navigate("/admin/emergencies");
  };

  const isOverviewActive = location.pathname === "/admin/overview";
  const isUsersActive =
    location.pathname.startsWith("/admin/users") ||
    USER_SUB_ITEMS.some((item) => location.pathname === item.path);

  const navLinkClasses = (active) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      active
        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400"
    }`;

  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      {/* TOP HEADER CONTROLS BAR */}
      <div className="h-16 shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <img src={logo} alt="EmSTraP Logo" className="h-9 sm:h-10 object-contain" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/admin/overview" className={navLinkClasses(isOverviewActive)}>
            <BarChart3 className="w-5 h-5" />
            <span>Overview</span>
          </Link>

          <div className="relative" ref={usersMenuRef}>
            <button
              type="button"
              onClick={() => setUsersMenuOpen((prev) => !prev)}
              className={navLinkClasses(isUsersActive || usersMenuOpen)}
              aria-expanded={usersMenuOpen}
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${usersMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {usersMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden">
                <Link
                  to="/admin/users"
                  className={`mx-1.5 mb-0.5 flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors font-semibold ${
                    location.pathname === "/admin/users"
                      ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Users className="w-4 h-4" /> All Users
                </Link>
                <div className="mx-1.5 my-1 border-t border-gray-100 dark:border-gray-800" />
                {USER_SUB_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`mx-1.5 flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors font-medium ${
                        location.pathname === item.path
                          ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Connect Engine Live Map Access Link */}
          <Link
            to="/admin/emergencies"
            className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm hover:shadow-md animate-pulse hover:animate-none"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE DISPATCH</span>
          </Link>
        </div>

        {/* Global Utilities Tray */}
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={clearAlertBadge}
            className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6" />
            {liveAlertsCount > 0 ? (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border border-white dark:border-gray-900 shadow-sm animate-bounce">
                {liveAlertsCount}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
            )}
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

          {/* Profile Context Segment */}
          <div className="relative" ref={profileDropdownRef}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageChange}
            />
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 to-rose-500 text-white font-bold flex items-center justify-center hover:scale-105 border-2 border-white dark:border-gray-800 shadow-md transition-all ring-2 ring-red-500/20"
              aria-label="User menu"
              aria-expanded={dropdownOpen}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden origin-top-right">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
                  <button 
                    type="button" 
                    className="relative group shrink-0 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-500" 
                    onClick={triggerImagePicker}
                    aria-label="Change avatar photo"
                  >
                    <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-rose-500 text-white font-bold flex items-center justify-center">
                      {profileImage ? (
                        <img src={profileImage} alt="Current profile miniature" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">{userInitial}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                  </button>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user?.name || "Admin"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email || "system@emstrap.org"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <button type="button" onClick={triggerImagePicker} className="text-xs text-red-500 hover:text-red-600 font-medium">Change</button>
                      {profileImage && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <button type="button" onClick={removeProfileImage} className="text-xs text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 font-medium">Remove</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <Link to="/admin/overview" onClick={() => setDropdownOpen(false)} className="md:hidden w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center gap-2 font-medium"><BarChart3 className="w-4 h-4" /> Overview</Link>
                  <Link to="/admin/users" onClick={() => setDropdownOpen(false)} className="md:hidden w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center gap-2 font-medium"><Users className="w-4 h-4" /> Users</Link>
                  
                  <button type="button" onClick={() => { setDropdownOpen(false); navigate("/admin/profile"); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center gap-2 font-medium"><User className="w-4 h-4" /> Profile</button>
                  <button type="button" onClick={() => { setDropdownOpen(false); toggleTheme(); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center gap-2 font-medium">
                    {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </button>
                  <button type="button" onClick={() => { setDropdownOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors flex items-center gap-2 font-semibold border-t border-gray-100 dark:border-gray-800 mt-1 pt-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE EXPANDED DROPDOWN LISTING */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 space-y-1 sticky top-16 z-30">
          <Link
            to="/admin/overview"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold ${
              isOverviewActive ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "text-gray-600 dark:text-gray-300"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Overview
          </Link>
          <Link
            to="/admin/users"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold ${
              location.pathname === "/admin/users" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "text-gray-600 dark:text-gray-300"
            }`}
          >
            <Users className="w-4 h-4" /> All Users
          </Link>
          {USER_SUB_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2.5 pl-8 pr-3 py-2 rounded-xl text-sm font-medium ${
                  location.pathname === item.path ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Icon className="w-4 h-4" /> {item.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* PAGE CONTENT WRAPPER */}
      <div className="p-6 md:p-12 w-full max-w-[1600px] mx-auto">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{title}</h1>
            {description && <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">{description}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </header>

        {children}
      </div>
    </div>
  );
}