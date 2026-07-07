import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import socket, { connectSocket } from "../app/socket";

/* ================================
   APP CORE
================================ */
function AppCore() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ================================
     SOCKET ENGINE
  ================================= */
  useEffect(() => {
    connectSocket();

    const handleConnect = () => console.log("🟢 SOCKET CONNECTED:", socket.id);
    const handleDisconnect = () => console.log("🔴 SOCKET DISCONNECTED");
    const handleError = (err) => console.log("⚠ SOCKET ERROR:", err.message);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
    };
  }, []);

  /* ================================
     AUTO REDIRECT FIX (MAIN FIX)
  ================================= */
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (token && location.pathname === "/") {
      if (role === "admin") navigate("/admin");
      else if (role === "police") navigate("/police");
      else if (role === "hospital") navigate("/hospital");
      else navigate("/dashboard");
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "#18181b",
            color: "#fff",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <DriverNotificationListener />

      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <main className="flex-1">
          <AppRoutes />
        </main>

        <Footer />
      </div>
    </>
  );
}

/* ================================
   WRAPPER
================================ */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EmergencyProvider>
          <AppCore />
        </EmergencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}