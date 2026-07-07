import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";

import AdminDetailGrid from "../../components/admin/AdminDetailGrid";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminModal from "../../components/admin/AdminModal";
import AdminSurface from "../../components/admin/AdminSurface";

import {
  AdminEmptyRow,
  AdminLoadingRow,
} from "../../components/admin/AdminTableState";

import { formatDate } from "../../components/admin/admin.utils";
import { getErrorMessage } from "../../services/api";

import {
  addAmbulance,
  deleteAmbulance,
  getAmbulances,
  updateAmbulance,
} from "../../services/ambulanceApi";

// -----------------------------
// UI TOKENS
// -----------------------------
const cls = {
  input:
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm",
  select:
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm",
  btnPrimary: "px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold",
  btnSave: "px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold",
  btnCancel: "px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 font-bold",
  btnNav:
    "px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700",
};

const initialForm = {
  name: "",
  vehicleNumber: "",
  mobile: "",
  address: "",
  city: "",
  email: "",
  password: "",
  driverStatus: "OFFLINE",
};

// -----------------------------
// MAIN COMPONENT
// -----------------------------
export default function AdminAmbulance() {
  const [ambulances, setAmbulances] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // -----------------------------
  // GOOGLE NAV (NEW)
  // -----------------------------
  const openGoogleNav = (lat, lng) => {
    if (!lat || !lng) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  // -----------------------------
  // FETCH
  // -----------------------------
  const fetchAmbulances = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const res = await getAmbulances();
      if (res.success) setAmbulances(res.ambulances || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load drivers"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  // -----------------------------
  // FORM
  // -----------------------------
  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(initialForm);
  }, []);

  // -----------------------------
  // CREATE
  // -----------------------------
  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);

      try {
        const res = await addAmbulance(form);
        if (res.success) {
          toast.success("Driver added");
          setAmbulances((p) => [res.ambulance, ...p]);
          resetForm();
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setSaving(false);
      }
    },
    [form, resetForm]
  );

  // -----------------------------
  // UPDATE
  // -----------------------------
  const handleUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      if (!editing) return;

      setSaving(true);

      try {
        const res = await updateAmbulance(editing._id, form);

        if (res.success) {
          setAmbulances((p) =>
            p.map((a) => (a._id === editing._id ? res.ambulance : a))
          );

          setSelected(res.ambulance);
          setEditing(null);
          toast.success("Updated");
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setSaving(false);
      }
    },
    [editing, form]
  );

  // -----------------------------
  // DELETE (FIXED DEPENDENCY)
  // -----------------------------
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Delete this driver?")) return;

      const prev = ambulances;
      setAmbulances((p) => p.filter((a) => a._id !== id));

      try {
        const res = await deleteAmbulance(id);
        if (!res.success) throw new Error();
        toast.success("Deleted");
      } catch (err) {
        setAmbulances(prev);
        toast.error("Delete failed");
      }
    },
    [ambulances]
  );

  // -----------------------------
  // DETAILS
  // -----------------------------
  const getDetails = useCallback(
    (a) => ({
      Name: a.name,
      Vehicle: a.vehicleNumber,
      Mobile: a.mobile,
      City: a.city,
      Status: a.driverStatus,
      Created: formatDate(a.createdAt),
      ID: a._id,
    }),
    []
  );

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <AdminLayout
      title="Ambulance Control Center"
      description="Real-time driver management system"
      actions={
        <button
          onClick={() => fetchAmbulances(true)}
          disabled={refreshing}
          className={cls.btnCancel}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      {/* ADD FORM */}
      <AdminSurface className="p-6 mb-6">
        <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-4">
          <input name="name" value={form.name} onChange={onChange} placeholder="Driver name" className={cls.input} />
          <input name="vehicleNumber" value={form.vehicleNumber} onChange={onChange} placeholder="Vehicle" className={cls.input} />
          <input name="mobile" value={form.mobile} onChange={onChange} placeholder="Mobile" className={cls.input} />
          <input name="email" value={form.email} onChange={onChange} placeholder="Email" className={cls.input} />

          <button type="submit" disabled={saving} className={cls.btnPrimary}>
            {saving ? "Saving..." : "Add Driver"}
          </button>

          <button type="button" onClick={resetForm} className={cls.btnCancel}>
            Clear
          </button>
        </form>
      </AdminSurface>

      {/* TABLE */}
      <AdminSurface>
        {loading ? (
          <AdminLoadingRow colSpan={5} />
        ) : ambulances.length === 0 ? (
          <AdminEmptyRow colSpan={5} />
        ) : (
          <table className="w-full">
            <tbody>
              {ambulances.map((a) => (
                <tr key={a._id}>
                  <td>{a.name}</td>
                  <td>{a.vehicleNumber}</td>
                  <td>{a.mobile}</td>

                  <td className="flex gap-2 flex-wrap">
                    <button onClick={() => setSelected(a)}>View</button>
                    <button onClick={() => setEditing(a)}>Edit</button>

                    {/* 🧭 NAVIGATION BUTTON */}
                    <button
                      onClick={() =>
                        openGoogleNav(a.latitude || a.lat, a.longitude || a.lng)
                      }
                      className={cls.btnNav}
                    >
                      Navigate
                    </button>

                    <button onClick={() => handleDelete(a._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminSurface>

      {/* VIEW MODAL */}
      {selected && (
        <AdminModal title="Driver Details" onClose={() => setSelected(null)}>
          <AdminDetailGrid data={getDetails(selected)} />

          {/* 🧭 MAP BUTTON INSIDE MODAL */}
          <div className="mt-4">
            <button
              className={cls.btnNav}
              onClick={() =>
                openGoogleNav(selected.latitude, selected.longitude)
              }
            >
              Open in Google Maps
            </button>
          </div>
        </AdminModal>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <AdminModal title="Edit Driver" onClose={() => setEditing(null)}>
          <form onSubmit={handleUpdate} className="grid gap-3">
            <input name="name" value={form.name} onChange={onChange} />
            <input name="vehicleNumber" value={form.vehicleNumber} onChange={onChange} />

            <button className={cls.btnSave}>
              {saving ? "Saving..." : "Update"}
            </button>
          </form>
        </AdminModal>
      )}
    </AdminLayout>
  );
}