import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AdminDetailGrid from "../../components/admin/AdminDetailGrid";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminModal from "../../components/admin/AdminModal";
import AdminSurface from "../../components/admin/AdminSurface";
import { AdminEmptyRow, AdminLoadingRow } from "../../components/admin/AdminTableState";
import { formatDate } from "../../components/admin/admin.utils";
import { getErrorMessage } from "../../services/api";

import {
  addHospital,
  deleteHospital,
  getHospitals,
  updateHospital,
} from "../../services/hospitalApi";

/* ---------------- UI ---------------- */

const cls = {
  input:
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm",
  btnPrimary:
    "px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold",
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
  tableRow:
    "hover:bg-blue-50/60 dark:hover:bg-blue-950/20 cursor-pointer",
  th: "p-4 text-xs font-bold uppercase text-gray-400",
  td: "p-4",
};

/* ---------------- INITIAL STATE ---------------- */

const initialForm = {
  name: "",
  address: "",
  city: "",
  mobile: "",
  email: "",
  password: "",
};

export default function Hospital() {
  const [form, setForm] = useState(initialForm);
  const [hospitals, setHospitals] = useState([]);

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [editingHospital, setEditingHospital] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /* ---------------- FETCH ---------------- */

  const fetchHospitals = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const res = await getHospitals();
      if (res.success) setHospitals(res.hospitals || []);
      setError("");
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load hospitals");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  /* ---------------- FORM ---------------- */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => setForm(initialForm);

  const handleEdit = (h) => {
    setEditingHospital(h);
    setForm({
      name: h.name || "",
      address: h.address || "",
      city: h.city || "",
      mobile: h.mobile || "",
      email: h.email || "",
      password: "",
    });
  };

  const closeEditModal = () => {
    setEditingHospital(null);
    resetForm();
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingHospital) {
        const res = await updateHospital(editingHospital._id, form);

        if (res.success) {
          setHospitals((prev) =>
            prev.map((h) =>
              h._id === editingHospital._id ? res.hospital : h
            )
          );

          setSelectedHospital((prev) =>
            prev?._id === editingHospital._id ? res.hospital : prev
          );

          toast.success("Hospital updated");
          closeEditModal();
        }
      } else {
        const res = await addHospital(form);

        if (res.success) {
          setHospitals((prev) => [res.hospital, ...prev]);
          toast.success("Hospital added");
          resetForm();
        }
      }

      setError("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    const tid = toast.loading("Deleting hospital...");

    try {
      const res = await deleteHospital(id);

      if (res.success) {
        setHospitals((prev) => prev.filter((h) => h._id !== id));

        if (selectedHospital?._id === id) setSelectedHospital(null);

        toast.success("Hospital deleted", { id: tid });
      }
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  };

  /* ---------------- DETAILS ---------------- */

  const getHospitalDetails = (h) => ({
    Name: h.name,
    Address: h.address,
    City: h.city,
    Mobile: h.mobile,
    Email: h.email,
    "Created Date": formatDate(h.createdAt),
    "Updated Date": formatDate(h.updatedAt),
    "Hospital ID": h._id,
  });

  /* ---------------- UI ---------------- */

  return (
    <AdminLayout
      title="Hospital Management"
      description="Create, view, update, and remove hospitals"
      actions={
        <button
          onClick={() => fetchHospitals({ silent: true })}
          className={cls.btnRefresh}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      {/* ERROR */}
      {error && (
        <div className="text-red-500 mb-4 text-sm">{error}</div>
      )}

      {/* FORM */}
      <AdminSurface className="mb-6 p-6">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Hospital name"
            className={cls.input}
            required
          />

          <input
            name="mobile"
            value={form.mobile}
            onChange={handleInputChange}
            placeholder="Mobile"
            className={cls.input}
            required
          />

          <input
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Email"
            className={cls.input}
            required
          />

          <input
            name="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Password"
            type="password"
            className={cls.input}
          />

          <input
            name="address"
            value={form.address}
            onChange={handleInputChange}
            placeholder="Address"
            className={cls.input}
            required
          />

          <input
            name="city"
            value={form.city}
            onChange={handleInputChange}
            placeholder="City"
            className={cls.input}
            required
          />

          <div className="flex gap-3">
            <button className={cls.btnPrimary} disabled={saving}>
              {saving ? "Saving..." : "Add Hospital"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className={cls.btnCancel}
            >
              Clear
            </button>
          </div>
        </form>
      </AdminSurface>

      {/* TABLE */}
      <AdminSurface>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={cls.th}>Name</th>
                <th className={cls.th}>City</th>
                <th className={cls.th}>Mobile</th>
                <th className={cls.th}>Email</th>
                <th className={cls.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <AdminLoadingRow colSpan={5} />
              ) : hospitals.length === 0 ? (
                <AdminEmptyRow colSpan={5} />
              ) : (
                hospitals.map((h) => (
                  <tr
                    key={h._id}
                    className={cls.tableRow}
                    onClick={() => setSelectedHospital(h)}
                  >
                    <td className={cls.td}>{h.name}</td>
                    <td className={cls.td}>{h.city}</td>
                    <td className={cls.td}>{h.mobile}</td>
                    <td className={cls.td}>{h.email}</td>

                    <td className={cls.td}>
                      <div className="flex gap-2">
                        <button
                          className={cls.btnView}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHospital(h);
                          }}
                        >
                          View
                        </button>

                        <button
                          className={cls.btnEdit}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(h);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className={cls.btnDel}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(h._id);
                          }}
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

      {/* MODAL */}
      {selectedHospital && (
        <AdminModal
          title={selectedHospital.name}
          onClose={() => setSelectedHospital(null)}
        >
          <AdminDetailGrid
            data={getHospitalDetails(selectedHospital)}
          />
        </AdminModal>
      )}

      {editingHospital && (
        <AdminModal
          title="Update Hospital"
          onClose={closeEditModal}
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleInputChange}
              className={cls.input}
              required
            />

            <button
              className={cls.btnSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </AdminModal>
      )}
    </AdminLayout>
  );
}