import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  User,
  Calendar,
  Activity,
  Download,
} from "lucide-react";

export default function PatientRecords({ patients = [], onSelect }) {
  const [search, setSearch] = useState("");

  /* ---------------- FILTER (OPTIMIZED) ---------------- */
  const filtered = useMemo(() => {
    const key = search.toLowerCase().trim();

    if (!key) return patients;

    return patients.filter((p) => {
      return (
        p?.name?.toLowerCase().includes(key) ||
        p?.id?.toLowerCase().includes(key) ||
        p?.condition?.toLowerCase().includes(key)
      );
    });
  }, [patients, search]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-black flex items-center gap-2">
          <FileText className="text-blue-600" size={20} />
          Patient Records
        </h2>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
          {filtered.length}
        </span>
      </div>

      {/* SEARCH */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient, ID, condition..."
          className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* LIST */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">

        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-sm">
            No patient records found
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p?.id || p?._id}
              className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition"
            >

              {/* TOP */}
              <div className="flex justify-between items-start">

                <div>
                  <h3 className="font-bold flex items-center gap-2">
                    <User size={14} />
                    {p?.name || "Unknown Patient"}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    ID: {p?.id || "N/A"}
                  </p>
                </div>

                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 font-bold">
                  {p?.condition || "Stable"}
                </span>

              </div>

              {/* INFO */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">

                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  {p?.admittedAt || "N/A"}
                </div>

                <div className="flex items-center gap-1">
                  <Activity size={12} />
                  {p?.status || "Under Observation"}
                </div>

              </div>

              {/* ACTIONS */}
              <div className="flex justify-between items-center mt-4">

                <button
                  onClick={() => onSelect?.(p)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View Details
                </button>

                <button className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                  <Download size={12} />
                  Report
                </button>

              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}