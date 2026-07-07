
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import { getIO } from "../socket/socket.js";

const VALID_PAYMENT_METHODS = ["CASH", "CARD", "UPI"];

/* -----------------------------
   GET PAYMENT STATUS
------------------------------*/
export const getPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const payment = await Payment.findOne({ booking: bookingId });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "No payment record found for this booking",
            });
        }

        const isOwner =
            payment.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this payment",
            });
        }

        return res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/* -----------------------------
   PROCESS PAYMENT
------------------------------*/
export const processPayment = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { paymentMethod } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        const isOwner =
            booking.user.toString() === req.user._id.toString();

        if (!isOwner) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to pay for this booking",
            });
        }

        let payment = await Payment.findOne({ booking: bookingId });

        if (payment?.status === "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "This booking has already been paid for",
            });
        }

        const resolvedMethod = VALID_PAYMENT_METHODS.includes(paymentMethod)
            ? paymentMethod
            : booking.paymentMethod || "CASH";

        const transactionId = `TXN${Date.now()}${crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase()}`;

        const amount = booking.estimatedPrice || 0;

        /* -----------------------------
           CREATE / UPDATE PAYMENT
        ------------------------------*/
        if (payment) {
            payment.status = "COMPLETED";
            payment.paymentMethod = resolvedMethod;
            payment.transactionId = transactionId;
            payment.amount = amount;
            payment.paidAt = new Date();
            await payment.save();
        } else {
            payment = await Payment.create({
                booking: bookingId,
                user: booking.user,
                amount,
                paymentMethod: resolvedMethod,
                status: "COMPLETED",
                transactionId,
                paidAt: new Date(),
            });
        }

        /* -----------------------------
           SYNC BOOKING
        ------------------------------*/
        booking.paymentMethod = resolvedMethod;
        await booking.save();

        /* -----------------------------
           🚨 LIVE DASHBOARD SYNC (UPGRADED)
        ------------------------------*/
        const io = getIO();

        const payload = {
            bookingId: booking._id.toString(),
            requestId: booking.requestId?.toString() || null,

            status: "COMPLETED",
            paymentStatus: "COMPLETED",
            paymentMethod: resolvedMethod,

            amount,
            transactionId,
            paidAt: payment.paidAt,
        };

        // 🧠 Global update (admin/police dashboards)
        io.emit("payment_updated", payload);

        // 🚑 Ambulance-specific room update
        io.to("ambulance").emit("ambulance_payment_updated", payload);

        // 👮 Police control center update
        io.to("police").emit("police_payment_updated", payload);

        /* -----------------------------
           OPTIONAL: LINK TO EMERGENCY FLOW
           (for your map + navigation UI sync)
        ------------------------------*/
        if (booking.requestId) {
            io.emit("emergency_payment_linked", {
                requestId: booking.requestId.toString(),
                bookingId: booking._id.toString(),
                paymentStatus: "COMPLETED",
                paymentMethod: resolvedMethod,
            });
        }

        return res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};