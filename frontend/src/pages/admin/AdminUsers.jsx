import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AdminDetailGrid from "../../components/admin/AdminDetailGrid";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminModal from "../../components/admin/AdminModal";
import AdminSurface from "../../components/admin/AdminSurface";
import {
  AdminEmptyRow,
  AdminLoadingRow,
} from "../../components/admin/AdminTableState";

import { formatDate, roleOptions } from "../../components/admin/admin.utils";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import { deleteUser, getUsers, updateUser } from "../../services/userApi";

/* ---------------- UI TOKENS ---------------- */

const cls = {
  input:
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm",
  select:
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm",
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

/* ---------------- ROLE CONFIG ---------------- */

const getRoleConfig = (role) => {
  switch (role) {
    case "police":
    case "police_hq":
      return {
        avatarBg:
          "from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/30",
        avatarText: "text-blue-700 dark:text-blue-300",
        badge:
          "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40",
        label: role === "police_hq" ? "Police HQ" : "Police",
      };
    case "hospital":
    case "hospital_admin":
      return {
        avatarBg:
          "from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/30",
        avatarText: "text-cyan-700 dark:text-cyan-300",
        badge:
          "bg-cyan-100 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800/40",
        label: "Hospital",
      };
    case "ambulance_driver":
      return {
        avatarBg:
          "from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/30",
        avatarText: "text-red-700 dark:text-red-300",
        badge:
          "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/40",
        label: "Driver",
      };
    case "admin":
      return {
        avatarBg:
          "from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30",
        avatarText: "text-amber-700 dark:text-amber-300",
        badge:
          "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/40",
        label: "Admin",
      };
    default:
      return {
        avatarBg:
          "from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/30",
        avatarText: "text-indigo-700 dark:text-indigo-300",
        badge:
          "bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/40",
        label: "User",
      };
  }
};

/* ---------------- INITIAL FORM ---------------- */

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  city: "",
  address: "",
  role: "user",
  vehicleNumber: "",
  isEmailVerified: false,
};

export default function AdminUsers() {
  const { currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /* ---------------- FETCH ---------------- */

  const fetchUsers = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const res = await getUsers();
      if (res.success) setUsers(res.users || []);
      setError("");
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load users");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------------- FILTER ---------------- */

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  /* ---------------- FORM ---------------- */

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((c) => ({
      ...c,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      city: user.city || "",
      address: user.address || "",
      role: user.role || "user",
      vehicleNumber: user.vehicleNumber || "",
      isEmailVerified: Boolean(user.isEmailVerified),
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setForm(initialForm);
  };

  /* ---------------- UPDATE ---------------- */

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);

    try {
      const res = await updateUser(editingUser._id, form);

      if (res.success) {
        setUsers((c) =>
          c.map((u) =>
            u._id === editingUser._id ? res.user : u
          )
        );

        setSelectedUser((c) =>
          c?._id === editingUser._id ? res.user : c
        );

        toast.success("User updated");
        closeEditModal();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update user"));
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDeleteUser = async (id) => {
    const tid = toast.loading("Deleting user…");

    try {
      const res = await deleteUser(id);

      if (res.success) {
        setUsers((c) => c.filter((u) => u._id !== id));

        if (selectedUser?._id === id) setSelectedUser(null);

        toast.success("User deleted", { id: tid });
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete user"), {
        id: tid,
      });
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <AdminLayout
      title="User Management"
      description="View, update, and delete user records."
      actions={
        <button
          onClick={() => fetchUsers({ silent: true })}
          disabled={refreshing}
          className={cls.btnRefresh}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      }
    >
      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <AdminSurface>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {loading ? (
                <AdminLoadingRow colSpan={5} />
              ) : filteredUsers.length === 0 ? (
                <AdminEmptyRow colSpan={5} />
              ) : (
                filteredUsers.map((user) => {
                  const config = getRoleConfig(user.role);

                  return (
                    <tr key={user._id}>
                      <td className={cls.td}>{user.name}</td>
                      <td className={cls.td}>{user.email}</td>
                      <td className={cls.td}>{user.city}</td>

                      <td className={cls.td}>
                        <span className={config.badge}>
                          {config.label}
                        </span>
                      </td>

                      <td className={cls.td}>
                        <button onClick={() => setSelectedUser(user)}>
                          View
                        </button>
                        <button onClick={() => openEditModal(user)}>
                          Edit
                        </button>
                        <button
                          disabled={currentUser?._id === user._id}
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminSurface>
    </AdminLayout>
  );
}