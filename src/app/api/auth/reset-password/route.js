import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        await connectDB();

        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { message: "Email, OTP, and new password are required" },
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

        // Check OTP & expiry
        if (
            user.resetOtp !== otp ||
            !user.resetOtpExpires ||
            user.resetOtpExpires < new Date()
        ) {
            return NextResponse.json(
                { message: "Invalid or expired OTP" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear OTP
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;

        await user.save();

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("❌ Reset Password Error:", error);

        return NextResponse.json(
            { message: "Password reset failed", error: error.message },
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
