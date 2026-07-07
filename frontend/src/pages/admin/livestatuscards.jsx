import AdminStatCard from "./AdminStatCard";

export default function LiveStatusCards({ stats = {} }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <AdminStatCard
        title="Users"
        value={stats.users ?? 0}
        accent="bg-indigo-500"
        helper="Registered Users"
      />

      <AdminStatCard
        title="Bookings"
        value={stats.bookings ?? 0}
        accent="bg-green-500"
        helper="Bookings"
      />

      <AdminStatCard
        title="Hospitals"
        value={stats.hospitals ?? 0}
        accent="bg-blue-500"
        helper="Hospitals"
      />

      <AdminStatCard
        title="Emergencies"
        value={stats.emergencies ?? 0}
        accent="bg-red-500"
        helper="Emergency Requests"
      />

      <AdminStatCard
        title="Police"
        value={stats.police ?? 0}
        accent="bg-purple-500"
        helper="Police Units"
      />
    </div>
  );
}