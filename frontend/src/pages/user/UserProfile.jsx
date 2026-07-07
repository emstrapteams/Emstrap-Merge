import { useState, useEffect } from "react";
import API from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Container from "../../components/layout/Container";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { User, Activity, Edit3, Save, X } from "lucide-react";

export default function UserProfile() {
  const { loginUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [profileUser, setProfileUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    address: "",
    vehicleNumber: "",
  });

  /* ---------------- REAL STATS (fallback safe) ---------------- */
  const stats = profileUser?.stats || {
    bookings: 0,
    completed: 0,
    emergency: 0,
    cancelled: 0,
  };

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = async () => {
    try {
      setFetching(true);

      const res = await API.get("/auth/me");
      const data = res.data;

      setProfileUser(data);

      setFormData({
        name: data?.name || "",
        email: data?.email || "",
        mobile: data?.mobile || "",
        city: data?.city || "",
        address: data?.address || "",
        vehicleNumber: data?.vehicleNumber || "",
      });
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ---------------- INPUT ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- COMPLETION ---------------- */
  const getCompletion = () => {
    const base = [
      formData.name,
      formData.email,
      formData.mobile,
      formData.city,
      formData.address,
    ];

    const fields =
      profileUser?.role === "ambulance"
        ? [...base, formData.vehicleNumber]
        : base;

    const filled = fields.filter((v) => v?.trim()).length;

    return Math.round((filled / fields.length) * 100);
  };

  /* ---------------- UPDATE ---------------- */
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await API.put("/auth/profile", formData);
      const updated = res.data.user;

      setProfileUser(updated);
      loginUser(updated);

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="p-10 text-gray-400">Loading profile...</div>
        </Container>
      </>
    );
  }

  const profileCompletion = getCompletion();

  return (
    <>
      <Navbar />

      <Container>
        <div className="max-w-6xl mx-auto py-8 space-y-6">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-6 rounded-3xl">
            <h1 className="text-2xl font-bold">
              Welcome, {profileUser?.name}
            </h1>
            <p className="text-sm opacity-80">
              Manage your profile and account
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT */}
            <div className="space-y-4">

              {/* AVATAR */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold">
                  {profileUser?.name?.[0] || <User />}
                </div>

                <h2 className="mt-3 font-bold">{profileUser?.name}</h2>
                <p className="text-xs text-gray-500">
                  {profileUser?.role}
                </p>

                {/* PROGRESS */}
                <div className="mt-4 text-left">
                  <div className="flex justify-between text-xs">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-2 bg-red-500 rounded-full"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* STATS */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
                <h3 className="font-bold flex items-center gap-2 mb-3">
                  <Activity size={16} /> Stats
                </h3>

                <div className="grid grid-cols-2 gap-3 text-center text-sm">
                  <div>
                    <p className="text-gray-500">Bookings</p>
                    <p className="font-bold">{stats.bookings}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Completed</p>
                    <p className="text-green-500 font-bold">
                      {stats.completed}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Emergency</p>
                    <p className="text-red-500 font-bold">
                      {stats.emergency}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Cancelled</p>
                    <p className="text-yellow-500 font-bold">
                      {stats.cancelled}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">

              {/* HEADER */}
              <div className="flex justify-between mb-6">
                <h2 className="font-bold">Profile Details</h2>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 flex items-center gap-1"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditing(false)}>
                      <X size={16} />
                    </button>

                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="text-green-600"
                    >
                      <Save size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* FORM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                {Object.keys(formData)
                  .filter(
                    (key) =>
                      key !== "vehicleNumber" ||
                      profileUser?.role === "ambulance"
                  )
                  .map((key) => (
                    <input
                      key={key}
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      disabled={!isEditing || key === "email"}
                      placeholder={key}
                      className={`p-3 border rounded-xl ${
                        isEditing
                          ? "bg-white dark:bg-gray-800"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}