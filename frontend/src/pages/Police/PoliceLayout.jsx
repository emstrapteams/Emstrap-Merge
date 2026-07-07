import { useEffect, useState } from "react";
import PoliceHeader from "./PoliceHeader";
import NotificationSidebar from "./NotificationSidebar";

export default function PoliceLayout({
  children,
  liveNotifications = [],
  systemClock,
  latency,
  incidents = [],
  socketConnected,
  lastSyncTime,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);

      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">

      {/* HEADER */}
      <div className="sticky top-0 z-50">
        <PoliceHeader
          systemClock={systemClock}
          latency={latency}
          incidents={incidents}
          socketConnected={socketConnected}
          lastSyncTime={lastSyncTime}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
        />
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:relative
            z-40 lg:z-10
            h-full
            bg-slate-900
            border-r border-slate-800
            transition-all duration-300
            ease-in-out
            ${
              sidebarOpen
                ? "translate-x-0 w-[360px]"
                : "-translate-x-full lg:translate-x-0 lg:w-0"
            }
            overflow-hidden
            flex-shrink-0
          `}
        >
          <div className="w-[360px] h-full">
            <NotificationSidebar
              liveNotifications={liveNotifications}
            />
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-slate-950">

          <div className="p-4 md:p-6 space-y-6">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
}