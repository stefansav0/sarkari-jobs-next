import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StudyNews from "@/lib/models/StudyNews";

// Ensure DBConnection
connectDB();

/* -----------------------------------------
   🟦 GET — Fetch Study News by Slug
------------------------------------------*/
export async function GET(
    req: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params; // ⭐ IMPORTANT FIX

        if (!slug) {
            return NextResponse.json(
                { message: "❌ Slug is required" },
                { status: 400 }
            );
        }

        const newsItem = await StudyNews.findOne({ slug });
        if (!newsItem) {
            return NextResponse.json(
                { message: "❌ Study news not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(newsItem, { status: 200 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("🔥 Error fetching study news:", message);

        return NextResponse.json(
            { message: "❌ Server error", error: message },
            { status: 500 }
        );
    }
}

/* -----------------------------------------
   ❌ Block unsupported methods
------------------------------------------*/
export function POST() {
    return NextResponse.json(
        { message: "POST not allowed" },
        { status: 405 }
    );
}
