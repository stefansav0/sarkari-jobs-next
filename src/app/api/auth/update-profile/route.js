import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function PUT(req) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];

        // Decode JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { name, email } = await req.json();

        if (!name || !email) {
            return NextResponse.json(
                { error: "Name and email are required." },
                { status: 400 }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json(
                { error: "User not found." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { user: updatedUser },
            { status: 200 }
        );

    } catch (error) {
        console.error("❌ Update error:", error.message);

        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}

// ❌ Block other methods
export function GET() {
    return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
    );
}

export function POST() {
    return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
    );
}
