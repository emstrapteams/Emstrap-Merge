import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* Icons */
const HamburgerIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ChevronIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
  </svg>
);

const OverviewIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 19V9m5 10V5m5 14v-7" />
  </svg>
);

const UsersIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <circle cx="9" cy="8" r="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20c0-3 2.7-5 6-5s6 2 6 5M16 8a3 3 0 1 0 0-6M16.5 14.5c2.4.4 4.5 1.9 4.5 4.5" />
  </svg>
);

const LogoutIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

/* Submenu */
const subItems = [
  { name: "Emergencies", path: "/admin/emergencies" },
  { name: "Bookings", path: "/admin/bookings" },
  { name: "Hospitals", path: "/admin/hospitals" },
  { name: "Ambulance", path: "/admin/ambulance" },
  { name: "Police", path: "/admin/police" },
];

/* Role config (future-ready) */
const MENU_BY_ROLE = {
  admin: subItems,
};

export default function AdminSidebar({ onClose, role = "admin" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = useMemo(() => MENU_BY_ROLE[role] || subItems, [role]);

  const isSubActive = menuItems.some((i) =>
    location.pathname.startsWith(i.path)
  );

  const isOverviewActive = location.pathname === "/admin/overview";

  const [usersExpanded, setUsersExpanded] = useState(isSubActive);

  useEffect(() => {
    setUsersExpanded(isSubActive);
  }, [isSubActive]);

  const handleClose = () => {
    onClose?.();
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    handleClose();
    navigate("/login", { replace: true });
  };

  const handleUsersClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setUsersExpanded(true);
      return;
    }
    setUsersExpanded((p) => !p);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          flex flex-col
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <button onClick={() => setCollapsed((p) => !p)}>
              <HamburgerIcon />
            </button>

            {!collapsed && (
              <h2 className="font-black text-lg text-red-600">
                EmSTraP
              </h2>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">

          {/* Overview */}
          <SidebarLink
            to="/admin/overview"
            active={isOverviewActive}
            collapsed={collapsed}
            onClick={handleClose}
          >
            <OverviewIcon className="h-5 w-5" />
            Overview
          </SidebarLink>

          {/* Users Dropdown */}
          <div>
            <button
              onClick={handleUsersClick}
              className={`
                w-full flex items-center gap-3 py-3 rounded-xl font-bold
                ${collapsed ? "justify-center" : "px-4"}
                ${isSubActive ? "text-red-600 bg-red-50" : "text-gray-600"}
              `}
            >
              <UsersIcon className="h-5 w-5" />

              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Users</span>
                  <ChevronIcon
                    className={`transition-transform ${
                      usersExpanded ? "rotate-90" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {!collapsed && usersExpanded && (
              <div className="ml-6 mt-2 pl-3 border-l space-y-1">
                {menuItems.map((item) => {
                  const active = location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleClose}
                      className={`
                        block px-3 py-2 rounded-lg text-sm font-medium
                        transition
                        ${
                          active
                            ? "bg-red-50 text-red-600"
                            : "text-gray-500 hover:bg-gray-100"
                        }
                      `}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 py-3 rounded-xl font-bold
              text-red-600 hover:bg-red-50
              ${collapsed ? "justify-center" : "px-4"}
            `}
          >
            <LogoutIcon className="h-5 w-5" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* Reusable link */
function SidebarLink({ to, active, collapsed, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 py-3 rounded-xl font-bold relative
        transition
        ${collapsed ? "justify-center" : "px-4"}
        ${active ? "text-red-600 bg-red-50" : "text-gray-600 hover:bg-gray-100"}
      `}
    >
      {children}

      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 bg-red-500 rounded-r-full" />
      )}
    </Link>
  );
}