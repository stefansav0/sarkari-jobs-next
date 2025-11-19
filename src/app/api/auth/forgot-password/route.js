import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { sendOtpEmail } from "@/lib/sendEmail";

export async function POST(req) {
    try {
        await connectDB();

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // OTP expiry (5 minutes)
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        // Save OTP to user
        user.resetOtp = otp;
        user.resetOtpExpires = otpExpiry;
        await user.save();

        // Send OTP email
        await sendOtpEmail(user.email, user.name || "User", otp);

        return NextResponse.json(
            { message: "OTP sent successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("❌ Forgot Password Error:", error);

        return NextResponse.json(
            { message: "Failed to send OTP", error: error.message },
            { status: 500 }
        );
    }
}

// ❌ Block other methods
export function GET() {
    return NextResponse.json(
        { message: "Method Not Allowed" },
        { status: 405 }
    );
}
