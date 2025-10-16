// src/pages/api/auth/verify-otp.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { email, otp }: { email?: string; otp?: string } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    try {
        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "OTP not requested. Please register again." });
        }

        const now = new Date();

        if (String(user.otp) !== String(otp)) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires < now) {
            return res.status(400).json({ message: "OTP expired. Please register again." });
        }

        // ✅ All good: mark verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "✅ Email verified successfully" });
    } catch (err: unknown) {
        console.error("❌ Error in verify-otp API:", err);

        if (err instanceof Error) {
            return res.status(500).json({ message: "Server error", error: err.message });
        }

        return res.status(500).json({ message: "Unknown server error" });
    }
}
