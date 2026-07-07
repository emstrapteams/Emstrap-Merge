import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import { useMemo } from "react";

export default function Footer() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = !!user;

  const role = user?.role || "guest";

  const handleBooking = () => {
    navigate(isLoggedIn ? "/dashboard" : "/login");
  };

  const handleSOS = () => {
    navigate("/emergency");
  };

  const links = useMemo(() => {
    const base = [
      { name: "Emergency", path: "/" },
    ];

    const authLinks = isLoggedIn
      ? [{ name: "Dashboard", path: "/dashboard" }]
      : [
          { name: "Login", path: "/login" },
          { name: "Register", path: "/register" },
        ];

    const roleLinks =
      role === "admin"
        ? [{ name: "Admin Panel", path: "/admin/overview" }]
        : [];

    return [...base, ...authLinks, ...roleLinks];
  }, [isLoggedIn, role]);

  return (
    <footer className="bg-slate-900 text-white mt-16 relative">

      {/* SOS floating button (footer level safe) */}
      <button
        onClick={handleSOS}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg font-bold z-50"
      >
        SOS
      </button>

      <div className="max-w-6xl mx-auto px-4 py-10">

        <div className="grid md:grid-cols-3 gap-8">

          {/* Logo + About */}
          <div>
            <img src={logo} alt="EmSTraP Logo" className="h-12 mb-4" />

            <p className="text-gray-400 leading-relaxed">
              Real-time emergency ambulance system connecting users,
              hospitals, drivers and police with live tracking.
            </p>

            {/* system status indicator (UI only) */}
            <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              System Online
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-3">Quick Links</h3>

            <div className="flex flex-col gap-2 text-gray-400">
              {links.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="hover:text-white transition"
                >
                  {item.name}
                </Link>
              ))}

              <button
                onClick={handleBooking}
                className="text-left hover:text-white transition"
              >
                Booking
              </button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-3">Contact</h3>

            <p className="text-gray-400">📧 emstrap51@gmail.com</p>
            <p className="text-gray-400">📞 +91 9880882476</p>
            <p className="text-gray-400">📍 Bangalore, Karnataka, India</p>

            {/* optional trust badge */}
            <div className="mt-4 text-xs text-gray-500">
              Emergency response system v1.0
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} EmSTraP. All rights reserved.
        </div>

      </div>
    </footer>
  );
}