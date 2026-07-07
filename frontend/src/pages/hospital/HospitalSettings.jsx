import { useState } from "react";
import toast from "react-hot-toast";
import API from "../../services/api";

export default function HospitalSettings() {
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    hospitalName: "EMSTRAP Hospital",
    emergencyEnabled: true,
    autoDispatch: true,
    notifySMS: true,
    notifyEmail: false,
    maxAmbulances: 10,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);

      // 🔗 backend ready call (adjust endpoint if needed)
      await API.put("/hospital/settings", settings);

      toast.success("Settings updated successfully 🚑");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black">Hospital Settings</h1>
        <p className="text-gray-500">
          Configure emergency response and hospital operations
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-6">

        {/* HOSPITAL NAME */}
        <div>
          <label className="text-sm font-semibold">Hospital Name</label>
          <input
            value={settings.hospitalName}
            onChange={(e) => handleChange("hospitalName", e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-xl dark:bg-gray-800"
          />
        </div>

        {/* MAX AMBULANCES */}
        <div>
          <label className="text-sm font-semibold">Max Ambulances</label>
          <input
            type="number"
            value={settings.maxAmbulances}
            onChange={(e) =>
              handleChange("maxAmbulances", Number(e.target.value))
            }
            className="w-full mt-2 px-4 py-2 border rounded-xl dark:bg-gray-800"
          />
        </div>

        {/* TOGGLES */}
        <div className="grid md:grid-cols-2 gap-4">

          <Toggle
            label="Emergency System"
            value={settings.emergencyEnabled}
            onChange={(v) => handleChange("emergencyEnabled", v)}
          />

          <Toggle
            label="Auto Dispatch Ambulance"
            value={settings.autoDispatch}
            onChange={(v) => handleChange("autoDispatch", v)}
          />

          <Toggle
            label="SMS Notifications"
            value={settings.notifySMS}
            onChange={(v) => handleChange("notifySMS", v)}
          />

          <Toggle
            label="Email Notifications"
            value={settings.notifyEmail}
            onChange={(v) => handleChange("notifyEmail", v)}
          />
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={saveSettings}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* SYSTEM STATUS */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-bold text-lg mb-4">System Status</h2>

        <div className="grid md:grid-cols-3 gap-4 text-sm">

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="font-bold">API Server</p>
            <p className="text-green-600">Online</p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="font-bold">Socket Connection</p>
            <p className="text-blue-600">Active</p>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <p className="font-bold">Emergency Queue</p>
            <p className="text-orange-600">Monitoring</p>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------------- TOGGLE COMPONENT ---------------- */
function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-xl dark:border-gray-700">
      <span className="font-medium">{label}</span>

      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
          value ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}