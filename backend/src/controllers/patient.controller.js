import EmergencyRequest from "../models/emergencyRequest.model.js";

/* -----------------------------
   GET PATIENTS (HOSPITAL DASHBOARD)
------------------------------*/
export const getPatients = async (req, res) => {
    try {
        const records = await EmergencyRequest
            .find({
                hospital: { $ne: null }
            })
            .populate("user", "name mobile")
            .sort({ createdAt: -1 });

        const patients = records.map((record) => ({
            _id: record._id,

            /* -----------------------------
               BASIC INFO
            ------------------------------*/
            name: record.user?.name || "Anonymous Patient",
            age: record.age || "-",
            gender: record.gender || "-",

            accidentType:
                record.accidentType ||
                record.requestType ||
                "Emergency",

            doctorName:
                record.doctorName || "Not Assigned",

            ward:
                record.ward || "Emergency Ward",

            /* -----------------------------
               STATUS NORMALIZATION (IMPROVED)
            ------------------------------*/
            status:
                record.status === "COMPLETED"
                    ? "Completed"
                    : record.status === "ARRIVED_AT_LOCATION"
                    ? "Active"
                    : record.status === "AMBULANCE_ACCEPTED"
                    ? "Dispatched"
                    : "Pending",

            /* -----------------------------
               TIMELINE
            ------------------------------*/
            admissionDate: record.createdAt,
            createdAt: record.createdAt,

            /* -----------------------------
               🗺️ MAP SUPPORT (IMPORTANT)
            ------------------------------*/
            pickupLocation: record.pickupLocation || null,
            dropLocation: record.dropLocation || null,

            /* -----------------------------
               🚑 AMBULANCE INFO (FOR LIVE TRACKING)
            ------------------------------*/
            ambulance: record.ambulance || null,

            /* -----------------------------
               🧭 NAVIGATION READY FLAGS
            ------------------------------*/
            canNavigate: !!record.pickupLocation,
            hasHospitalLocation: !!record.dropLocation,
        }));

        return res.status(200).json({
            success: true,
            patients,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};