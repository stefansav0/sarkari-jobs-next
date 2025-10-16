// src/pages/api/auth/forgot-password.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";  // MongoDB connection helper
import User from "@/lib/models/User";
import { sendOtpEmail } from "@/lib/sendEmail";  // Email sending utility

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        await connectDB();
        console.log("✅ Database connected");

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found:", email);
            return res.status(404).json({ message: "User not found" });
        }
        console.log("✅ User found:", user.email);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set OTP expiry time: 5 minutes from now
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        // Save OTP and expiry to user document
        user.resetOtp = otp;
        user.resetOtpExpires = otpExpiry;
        await user.save();
        console.log("✅ OTP saved to user:", otp);

        // Send OTP email
        await sendOtpEmail(user.email, user.name || "User", otp);
        console.log(`✅ OTP email sent to ${user.email}`);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error: unknown) {
        console.error("❌ Error in forgot-password API:", error);

        if (error instanceof Error) {
            return res.status(500).json({ message: "Failed to send OTP", error: error.message });
        }

        return res.status(500).json({ message: "Failed to send OTP due to unknown error" });
    }
}
