import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        await connectDB();

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Please provide email and password" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // 🔍 Email must be verified
        if (!user.isVerified) {
            return NextResponse.json(
                { message: "Please verify your email before logging in" },
                { status: 403 }
            );
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            return NextResponse.json(
                { message: "JWT_SECRET is not defined" },
                { status: 500 }
            );
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return NextResponse.json(
            {
                message: "✅ Login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("❌ Login error:", error.message);
        return NextResponse.json(
            { message: "Server Error", error: error.message },
            { status: 500 }
        );
    }
}

// ❌ No GET method allowed
export function GET() {
    return NextResponse.json(
        { message: "Method GET Not Allowed" },
        { status: 405 }
    );
}
