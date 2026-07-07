import { useState, useEffect, useMemo } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import StatCard from "../../components/user/StatCard";
import UserDetailsModal from "./UserDetailsModal";
import UserBookings from "./UserBookings";
import UserPagination from "./UserPagination";

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const USERS_PER_PAGE = 10;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    blocked: 0,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/users");
      const data = res.data.users || [];

      setUsers(data);

      setStats({
        total: data.length,
        active: data.filter((u) => !u.blocked).length,
        verified: data.filter((u) => u.isVerified).length,
        blocked: data.filter((u) => u.blocked).length,
      });
    } catch (err) {
      toast.error("Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let data = [...users];

    if (search) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (u) =>
          u.name?.toLowerCase().includes(keyword) ||
          u.email?.toLowerCase().includes(keyword) ||
          u.mobile?.includes(keyword)
      );
    }

    if (statusFilter !== "ALL") {
      if (statusFilter === "ACTIVE") data = data.filter((u) => !u.blocked);
      if (statusFilter === "BLOCKED") data = data.filter((u) => u.blocked);
      if (statusFilter === "VERIFIED") data = data.filter((u) => u.isVerified);
    }

    if (cityFilter !== "ALL") {
      data = data.filter((u) => u.city === cityFilter);
    }

    return data;
  }, [users, search, statusFilter, cityFilter]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const cities = ["ALL", ...new Set(users.map((u) => u.city).filter(Boolean))];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-80 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-200" />
            ))}
          </div>
          <div className="h-20 bg-gray-200 rounded-2xl" />
          <div className="h-[450px] bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Users className="text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage all registered EMSTRAP users
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Users" value={stats.total} />
        <StatCard title="Active" value={stats.active} />
        <StatCard title="Verified" value={stats.verified} />
        <StatCard title="Blocked" value={stats.blocked} />
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <div className="grid md:grid-cols-4 gap-4">

          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-3 py-2"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
            <option value="VERIFIED">Verified</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border rounded-xl px-3 py-2"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-500">
            Showing
            <span className="font-bold mx-2">{filteredUsers.length}</span>
            users
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">

            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr className="text-left text-sm uppercase text-gray-500">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Verified</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400">
                    <Users size={48} className="mx-auto mb-3 opacity-40" />
                    <p className="font-semibold">No users found</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {user.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-xs text-gray-400">
                            #{user._id?.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.mobile}</p>
                    </td>

                    <td className="px-6 py-4">{user.city || "-"}</td>

                    <td className="px-6 py-4 capitalize">{user.role}</td>

                    <td className="px-6 py-4">
                      {user.isVerified ? (
                        <span className="text-green-600 font-bold text-xs">
                          Verified
                        </span>
                      ) : (
                        <span className="text-yellow-600 font-bold text-xs">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {user.blocked ? (
                        <span className="text-red-600 font-bold text-xs">
                          Blocked
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold text-xs">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600"
                        >
                          <Eye size={16} />
                        </button>

                        <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
                          <Pencil size={16} />
                        </button>

                        <button className="p-2 rounded-lg bg-red-50 text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-xl disabled:opacity-40"
          >
            Previous
          </button>

          <div className="font-semibold">
            Page {currentPage} / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-xl disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* MODALS */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {selectedBookings && (
        <UserBookings
          user={selectedBookings}
          bookings={selectedBookings.bookings || []}
          onClose={() => setSelectedBookings(null)}
        />
      )}

    </div>
  );
}