import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
    try {
        await connectDB();

        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json(
                { message: "Email and OTP are required" },
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

        if (user.isVerified) {
            return NextResponse.json(
                { message: "Email already verified" },
                { status: 400 }
            );
        }

        if (!user.otp || !user.otpExpires) {
            return NextResponse.json(
                { message: "OTP not requested. Please register again." },
                { status: 400 }
            );
        }

        // Check OTP match
        if (String(user.otp) !== String(otp)) {
            return NextResponse.json(
                { message: "Invalid OTP" },
                { status: 400 }
            );
        }

        // Check OTP expiry
        if (user.otpExpires < new Date()) {
            return NextResponse.json(
                { message: "OTP expired. Please register again." },
                { status: 400 }
            );
        }

        // ✅ Mark verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        return NextResponse.json(
            { message: "✅ Email verified successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ verify-otp error:", error);

        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

// ❌ Disable other methods
export function GET() {
    return NextResponse.json(
        { message: "Method Not Allowed" },
        { status: 405 }
    );
}
