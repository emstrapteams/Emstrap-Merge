import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import AdminDetailGrid from "../../components/admin/AdminDetailGrid";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminModal from "../../components/admin/AdminModal";
import AdminSurface from "../../components/admin/AdminSurface";
import {
  AdminEmptyRow,
  AdminLoadingRow,
} from "../../components/admin/AdminTableState";

import {
  bookingStatusOptions,
  formatDate,
} from "../../components/admin/admin.utils";

import {
  deleteBookingById,
  getAllAdminBookings,
  getErrorMessage,
  updateBookingStatus,
} from "../../services/api";

/* ---------------------- STYLES ---------------------- */

const cls = {
  select:
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm",
  btnSave:
    "px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold",
  btnCancel:
    "px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 font-bold",
  btnRefresh:
    "px-4 py-2.5 rounded-xl border border-violet-400 text-violet-700 font-bold",
  btnView:
    "px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold",
  btnEdit:
    "px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold",
  btnDel:
    "px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold",
  btnMap:
    "px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold",
  tableRow: "hover:bg-indigo-50 dark:hover:bg-indigo-950/20 cursor-pointer",
  th: "p-4 text-xs font-bold uppercase text-gray-400",
  td: "p-4",
};

/* ---------------------- HELPERS ---------------------- */

const statusBadge = (status) => {
  const s = (status || "").toUpperCase();
  if (["COMPLETED", "RESOLVED"].includes(s))
    return "bg-emerald-100 text-emerald-700";
  if (["PENDING"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["IN_PROGRESS", "ASSIGNED"].includes(s))
    return "bg-blue-100 text-blue-700";
  if (["CANCELLED"].includes(s)) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(v || 0);

/* ---------------------- MAIN COMPONENT ---------------------- */

export default function AdminBookings({ socket }) {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("PENDING");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /* ---------------------- FETCH ---------------------- */

  const fetchBookings = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const res = await getAllAdminBookings();
      if (res.success) setBookings(res.bookings || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load bookings"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ---------------------- SOCKET SYNC (FIXED) ---------------------- */

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data) => {
      if (!data?.bookingId) return;

      setBookings((prev) =>
        prev.map((b) =>
          b._id === data.bookingId
            ? { ...b, ...data.booking }
            : b
        )
      );

      setSelectedBooking((prev) =>
        prev?._id === data.bookingId
          ? { ...prev, ...data.booking }
          : prev
      );
    };

    socket.on("booking-status-update", handleUpdate);
    socket.on("ambulance-location-update", handleUpdate);

    return () => {
      socket.off("booking-status-update", handleUpdate);
      socket.off("ambulance-location-update", handleUpdate);
    };
  }, [socket]);

  /* ---------------------- STATUS UPDATE ---------------------- */

  const handleStatusUpdate = async (id, status) => {
    const tid = toast.loading("Updating...");

    try {
      const res = await updateBookingStatus(id, status);

      if (res.success && res.booking) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? res.booking : b))
        );

        setSelectedBooking((prev) =>
          prev?._id === id ? res.booking : prev
        );

        toast.success("Updated", { id: tid });
        return true;
      }
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }

    return false;
  };

  /* ---------------------- DELETE ---------------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete booking?")) return;

    setDeletingId(id);
    const tid = toast.loading("Deleting...");

    try {
      const res = await deleteBookingById(id);

      if (res.success) {
        setBookings((prev) => prev.filter((b) => b._id !== id));
        toast.success("Deleted", { id: tid });
      }
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------------- GOOGLE MAP FIX (IMPROVED) ---------------------- */

  const openGoogleMaps = useCallback((b) => {
    const lat = b?.pickupLocation?.latitude;
    const lng = b?.pickupLocation?.longitude;

    if (!lat || !lng) {
      toast.error("Location not available");
      return;
    }

    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  }, []);

  /* ---------------------- UI ---------------------- */

  return (
    <AdminLayout
      title="Bookings"
      description="Manage emergency bookings in real time"
      actions={
        <button
          className={cls.btnRefresh}
          onClick={() => fetchBookings(true)}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      <AdminSurface>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={cls.th}>User</th>
                <th className={cls.th}>Route</th>
                <th className={cls.th}>Type</th>
                <th className={cls.th}>Price</th>
                <th className={cls.th}>Status</th>
                <th className={cls.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <AdminLoadingRow colSpan={6} />
              ) : bookings.length === 0 ? (
                <AdminEmptyRow colSpan={6} />
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className={cls.tableRow}>
                    <td className={cls.td}>{b.user?.name}</td>
                    <td className={cls.td}>{b.pickupLocation?.address}</td>
                    <td className={cls.td}>{b.ambulanceType}</td>
                    <td className={cls.td}>{formatCurrency(b.estimatedPrice)}</td>

                    <td className={cls.td}>
                      <span className={statusBadge(b.status)}>
                        {b.status}
                      </span>
                    </td>

                    <td className={cls.td}>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          className={cls.btnView}
                          onClick={() => setSelectedBooking(b)}
                        >
                          View
                        </button>

                        <button
                          className={cls.btnEdit}
                          onClick={() => {
                            setEditingBooking(b);
                            setBookingStatus(b.status);
                          }}
                        >
                          Update
                        </button>

                        <button
                          className={cls.btnMap}
                          onClick={() => openGoogleMaps(b)}
                        >
                          Map
                        </button>

                        <button
                          className={cls.btnDel}
                          disabled={deletingId === b._id}
                          onClick={() => handleDelete(b._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminSurface>

      {/* MODALS unchanged */}
      {selectedBooking && (
        <AdminModal
          title="Booking Details"
          onClose={() => setSelectedBooking(null)}
        >
          <AdminDetailGrid data={selectedBooking} />
        </AdminModal>
      )}

      {editingBooking && (
        <AdminModal
          title="Update Booking"
          onClose={() => setEditingBooking(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              await handleStatusUpdate(editingBooking._id, bookingStatus);
              setSaving(false);
              setEditingBooking(null);
            }}
            className="grid gap-4"
          >
            <select
              className={cls.select}
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value)}
            >
              {bookingStatusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button className={cls.btnSave} disabled={saving}>
                Save
              </button>

              <button
                type="button"
                className={cls.btnCancel}
                onClick={() => setEditingBooking(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </AdminLayout>
  );
}