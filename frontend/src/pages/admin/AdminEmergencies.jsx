import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import AdminDetailGrid from "../../components/admin/AdminDetailGrid";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminModal from "../../components/admin/AdminModal";
import AdminSurface from "../../components/admin/AdminSurface";
import LiveTrackingMap from "../../components/map/LiveTrackingMap";

import { formatDate } from "../../components/admin/admin.utils";

import {
  deleteEmergencyById,
  getAllEmergencies,
  getErrorMessage,
} from "../../services/api";

/* ---------------- UI ---------------- */

const cls = {
  btnRefresh:
    "px-4 py-2.5 rounded-xl border-2 border-violet-400 text-violet-700 font-bold",
  btnView:
    "px-4 py-2.5 rounded-xl bg-slate-100 text-sm font-bold",
  btnTrack:
    "px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-bold",
  btnDel:
    "px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold",
  btnMap:
    "px-4 py-2.5 rounded-xl bg-green-50 text-green-600 text-sm font-bold",
};

/* ---------------- HELPERS ---------------- */

const statusBadge = (s) => {
  const st = (s || "").toUpperCase();
  if (["RESOLVED", "COMPLETED"].includes(st))
    return "bg-green-100 text-green-700";
  if (["ASSIGNED", "IN_PROGRESS"].includes(st))
    return "bg-red-100 text-red-700";
  if (["PENDING"].includes(st))
    return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
};

/* ---------------- MAIN ---------------- */

export default function AdminEmergencies() {
  const [emergencies, setEmergencies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tracking, setTracking] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- FETCH ---------------- */

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const res = await getAllEmergencies();

      if (res.success) {
        setEmergencies(res.emergencies || []);
        setError("");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load emergencies"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------------- DELETE ---------------- */

  const handleDelete = useCallback(async (id) => {
    const tid = toast.loading("Deleting emergency...");

    try {
      const res = await deleteEmergencyById(id);

      if (res.success) {
        setEmergencies((prev) => prev.filter((e) => e._id !== id));

        if (selected?._id === id) setSelected(null);
        if (tracking?._id === id) setTracking(null);

        toast.success("Deleted", { id: tid });
      }
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  }, [selected, tracking]);

  /* ---------------- MAP ---------------- */

  const openGoogleMaps = useCallback((em) => {
    const loc = em?.location;

    if (!loc?.latitude || !loc?.longitude) {
      toast.error("No location found");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  /* ---------------- RENDER ---------------- */

  return (
    <AdminLayout
      title="Emergency Control Center"
      description="Live emergency dispatch monitoring system"
      actions={
        <button
          className={cls.btnRefresh}
          onClick={() => fetchData({ silent: true })}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      {error && (
        <div className="text-red-500 mb-4 text-sm">{error}</div>
      )}

      {/* LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-10">Loading...</div>
        ) : emergencies.length === 0 ? (
          <div className="text-center p-10 text-gray-500">
            No emergencies found
          </div>
        ) : (
          emergencies.map((em) => (
            <AdminSurface key={em._id} className="p-5">
              <div className="flex justify-between flex-wrap gap-3">

                {/* LEFT */}
                <div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-3 py-1 text-xs rounded ${statusBadge(em.status)}`}>
                      {em.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(em.createdAt)}
                    </span>
                  </div>

                  <p className="font-bold mt-2">
                    {em.user?.name || "Anonymous"}
                  </p>

                  <p className="text-xs text-gray-500">
                    {em.location?.latitude}, {em.location?.longitude}
                  </p>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex gap-2 flex-wrap">

                  <button
                    className={cls.btnView}
                    onClick={() => setSelected(em)}
                  >
                    View
                  </button>

                  <button
                    className={cls.btnTrack}
                    onClick={() => setTracking(em)}
                  >
                    Track
                  </button>

                  <button
                    className={cls.btnMap}
                    onClick={() => openGoogleMaps(em)}
                  >
                    Map
                  </button>

                  <button
                    className={cls.btnDel}
                    onClick={() => handleDelete(em._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* DRIVER INFO */}
              <div className="mt-4 text-sm text-gray-600">
                Driver: {em.ambulance?.name || "Unassigned"}
              </div>
            </AdminSurface>
          ))
        )}
      </div>

      {/* DETAILS MODAL */}
      {selected && (
        <AdminModal
          title="Emergency Details"
          onClose={() => setSelected(null)}
        >
          <AdminDetailGrid data={selected} />
        </AdminModal>
      )}

      {/* TRACKING MODAL */}
      {tracking && (
        <AdminModal
          title="Live Tracking"
          onClose={() => setTracking(null)}
        >
          <LiveTrackingMap
            height="450px"
            userLocation={
              tracking?.location?.latitude
                ? {
                    lat: tracking.location.latitude,
                    lng: tracking.location.longitude,
                  }
                : null
            }
            driverLocation={
              tracking?.ambulance?.latitude
                ? {
                    lat: tracking.ambulance.latitude,
                    lng: tracking.ambulance.longitude,
                  }
                : null
            }
          />

          <button
            className="mt-4 text-green-600 text-sm font-bold"
            onClick={() => openGoogleMaps(tracking)}
          >
            Open in Google Maps →
          </button>
        </AdminModal>
      )}
    </AdminLayout>
  );
}