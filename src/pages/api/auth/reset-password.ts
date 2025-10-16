// src/pages/api/auth/reset-password.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    try {
        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate OTP and expiry
        if (
            user.resetOtp !== otp ||
            !user.resetOtpExpires ||
            user.resetOtpExpires < new Date()
        ) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear OTP fields
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;

        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error: unknown) {
        console.error("❌ Error in reset-password API:", error);

        if (error instanceof Error) {
            return res.status(500).json({ message: "Password reset failed", error: error.message });
        }

        return res.status(500).json({ message: "Password reset failed due to unknown error" });
    }
}
