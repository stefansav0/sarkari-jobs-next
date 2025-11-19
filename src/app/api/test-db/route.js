import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
    try {
        await connectDB();

        return NextResponse.json(
            { message: "DB connected successfully" },
            { status: 200 }
        );
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : String(err);

        return NextResponse.json(
            {
                message: "DB connection failed",
                error: errorMessage,
            },
            { status: 500 }
        );
    }
}
