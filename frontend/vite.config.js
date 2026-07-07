import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiPort = env.VITE_API_PORT || "5000";
  const backendTarget =
    env.VITE_API_URL || `http://localhost:${apiPort}`;

  if (!env.VITE_API_URL) {
    console.warn("⚠️ VITE_API_URL not set. Using fallback:", backendTarget);
  }

  return {
    plugins: [react()],

    // ================================
    // DEV SERVER
    // ================================
    server: {
      host: true,
      port: 5173,

      proxy: {
        // REST APIs
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },

        "/auth": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },

        // SOCKET.IO (CRITICAL FOR YOUR PROJECT)
        "/socket.io": {
          target: backendTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },

    // ================================
    // BUILD OPTIMIZATION
    // ================================
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              "react",
              "react-dom",
              "react-router-dom",
            ],

            socket: ["socket.io-client"],
          },
        },
      },
    },
  };
});