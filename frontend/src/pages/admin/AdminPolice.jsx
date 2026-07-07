import { useEffect, useMemo, useState } from "react";
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
  addPoliceRecord,
  deletePoliceRecord,
  getPoliceRecords,
  updatePoliceRecord,
} from "../../services/policeApi";

/* ---------------- UI TOKENS ---------------- */

const cls = {
  input:
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm",
  select:
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm",
  btnPrimary:
    "px-5 py-2.5 rounded-xl bg-violet-600 text-white font-bold",
  btnSave:
    "px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold",
  btnCancel:
    "px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 font-bold",
  btnRefresh:
    "px-4 py-2.5 rounded-xl border-2 border-violet-400 text-violet-700 font-bold",
  btnView:
    "px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold",
  btnEdit:
    "px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold",
  btnDel:
    "px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold",
  th: "p-4 text-xs font-bold uppercase text-gray-400",
  td: "p-4",
};

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  password: "",
  address: "",
  city: "",
  role: "police",
};

/* ---------------- COMPONENT ---------------- */

export default function AdminPolice() {
  const [form, setForm] = useState(initialForm);
  const [editingPolice, setEditingPolice] = useState(null);
  const [selectedPolice, setSelectedPolice] = useState(null);
  const [policeRecords, setPoliceRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(editingPolice);

  /* ---------------- FETCH ---------------- */

  const fetchPolice = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const res = await getPoliceRecords();

      if (res.success) {
        setPoliceRecords(res.police || []);
      }

      setError("");
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load police records");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPolice();
  }, []);

  /* ---------------- FORM ---------------- */

  const resetForm = () => setForm(initialForm);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleEdit = (p) => {
    setEditingPolice(p);
    setForm({
      name: p.name || "",
      mobile: p.mobile || "",
      email: p.email || "",
      address: p.address || "",
      city: p.city || "",
      role: p.role || "police",
      password: "",
    });
  };

  const closeEditModal = () => {
    setEditingPolice(null);
    resetForm();
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing) {
        const res = await updatePoliceRecord(editingPolice._id, form);

        if (res.success) {
          setPoliceRecords((c) =>
            c.map((i) =>
              i._id === editingPolice._id ? (res.police ?? res.record) : i
            )
          );

          setSelectedPolice((c) =>
            c?._id === editingPolice._id ? (res.police ?? res.record) : c
          );

          toast.success("Police record updated");
          closeEditModal();
        }
      } else {
        const res = await addPoliceRecord(form);

        if (res.success) {
          setPoliceRecords((c) => [res.police, ...c]);
          toast.success("Police unit added");
          resetForm();
        }
      }

      setError("");
    } catch (err) {
      const msg = getErrorMessage(
        err,
        isEditing ? "Failed to update" : "Failed to add"
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    const tid = toast.loading("Deleting police record…");

    try {
      const res = await deletePoliceRecord(id);

      if (res.success) {
        setPoliceRecords((c) => c.filter((i) => i._id !== id));

        if (selectedPolice?._id === id) setSelectedPolice(null);

        toast.success("Police record removed", { id: tid });
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete"), { id: tid });
    }
  };

  /* ---------------- DETAILS ---------------- */

  const getPoliceDetails = (p) => ({
    Name: p.name,
    Role: p.role,
    Mobile: p.mobile,
    Email: p.email,
    Address: p.address,
    City: p.city,
    "Created Date": formatDate(p.createdAt),
    "Updated Date": formatDate(p.updatedAt),
    "Police ID": p._id,
  });

  /* ---------------- RENDER ---------------- */

  return (
    <AdminLayout
      title="Police Management"
      description="Create, view, update, and remove police unit records."
      actions={
        <button
          type="button"
          onClick={() => fetchPolice({ silent: true })}
          disabled={refreshing}
          className={cls.btnRefresh}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      }
    >
      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      {/* TABLE */}
      <AdminSurface>
        {loading ? (
          <AdminLoadingRow colSpan={5} />
        ) : policeRecords.length === 0 ? (
          <AdminEmptyRow colSpan={5} />
        ) : (
          <table className="w-full">
            <tbody>
              {policeRecords.map((p) => (
                <tr key={p._id}>
                  <td className={cls.td}>{p.name}</td>
                  <td className={cls.td}>{p.mobile}</td>
                  <td className={cls.td}>{p.email}</td>

                  <td className={cls.td}>
                    <button onClick={() => setSelectedPolice(p)}>View</button>
                    <button onClick={() => handleEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminSurface>

      {/* VIEW */}
      {selectedPolice && (
        <AdminModal
          title={selectedPolice.name}
          onClose={() => setSelectedPolice(null)}
        >
          <AdminDetailGrid data={getPoliceDetails(selectedPolice)} />
        </AdminModal>
      )}

      {/* EDIT */}
      {editingPolice && (
        <AdminModal
          title={`Update – ${editingPolice.name}`}
          onClose={closeEditModal}
        >
          <form onSubmit={handleSubmit} className="grid gap-3">
            <input name="name" value={form.name} onChange={handleInputChange} />
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleInputChange}
            />
            <input
              name="email"
              value={form.email}
              onChange={handleInputChange}
            />

            <input
              name="password"
              value={form.password}
              onChange={handleInputChange}
              placeholder={isEditing ? "Leave blank to keep" : ""}
              required={!isEditing}
            />

            <button className={cls.btnSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </AdminModal>
      )}
    </AdminLayout>
  );
}