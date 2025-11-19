import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StudyNews from "@/lib/models/StudyNews";

// Connect DB once globally
connectDB();

/* -----------------------------------------
   🟦 GET — Fetch Study News by Slug
------------------------------------------*/
export async function GET(req, { params }) {
    try {
        const { slug } = params; // App Router uses params, NOT req.query

        if (!slug) {
            return NextResponse.json(
                { message: "❌ Slug is required" },
                { status: 400 }
            );
        }

        const newsItem = await StudyNews.findOne({ slug });

        if (!newsItem) {
            return NextResponse.json(
                { message: "Study news not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(newsItem, { status: 200 });

    } catch (error) {
        console.error("🔥 Error fetching study news:", error);

        return NextResponse.json(
            {
                message: "❌ Server error",
                error: error.message,
            },
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
