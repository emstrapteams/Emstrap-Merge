import { useState } from "react";
import PoliceHeader from "./PoliceHeader";
import NotificationSidebar from "./NotificationSidebar";

export default function PoliceLayout({
  children,
  liveNotifications = [],
  systemClock,
  latency = 0,
  incidents = [],
  lastSyncTime,
  socketConnected = false,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">

      {/* HEADER */}
      <PoliceHeader
        systemClock={systemClock}
        latency={latency}
        incidents={incidents}
        lastSyncTime={lastSyncTime}
        socketConnected={socketConnected}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
        sidebarOpen={sidebarOpen}
      />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside
          className={`transition-all duration-300 border-r border-slate-800 bg-slate-900 ${
            sidebarOpen ? "w-[360px]" : "w-0 overflow-hidden"
          }`}
        >
          {sidebarOpen && (
            <NotificationSidebar liveNotifications={liveNotifications} />
          )}
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}