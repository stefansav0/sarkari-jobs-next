import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StudyNews from "@/lib/models/StudyNews";
import slugify from "slugify";

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
        const { slug } = await context.params;

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
   🟨 PUT — Update Study News by Slug
------------------------------------------*/
export async function PUT(
    req: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;
        const body = await req.json();

        if (!slug) {
            return NextResponse.json(
                { message: "❌ Slug is required" },
                { status: 400 }
            );
        }

        // If the frontend is trying to update the slug, ensure it's properly formatted
        if (body.slug) {
            body.slug = slugify(body.slug, { lower: true, strict: true });
            
            // Check if the new slug is already taken by another article
            if (body.slug !== slug) {
                const existing = await StudyNews.findOne({ slug: body.slug });
                if (existing) {
                    return NextResponse.json(
                        { message: "❌ This URL slug is already in use by another article." },
                        { status: 400 }
                    );
                }
            }
        }

        // Update the document with the new data (including SEO fields, etc.)
        const updatedNews = await StudyNews.findOneAndUpdate(
            { slug },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedNews) {
            return NextResponse.json(
                { message: "❌ Study news not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "✅ Study news updated successfully", news: updatedNews },
            { status: 200 }
        );

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("🔥 Error updating study news:", message);

        return NextResponse.json(
            { message: "❌ Server error", error: message },
            { status: 500 }
        );
    }
}

/* -----------------------------------------
   🟥 DELETE — Delete Study News by Slug
------------------------------------------*/
export async function DELETE(
    req: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params; 

        if (!slug) {
            return NextResponse.json(
                { message: "❌ Slug is required" },
                { status: 400 }
            );
        }

        // Delete the item matching the slug
        const deletedNews = await StudyNews.findOneAndDelete({ slug });
        
        if (!deletedNews) {
            return NextResponse.json(
                { message: "❌ Study news not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "✅ Study news deleted successfully" },
            { status: 200 }
        );

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("🔥 Error deleting study news:", message);

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
        { message: "POST not allowed on this route. Use the main /api/study-news route." },
        { status: 405 }
    );
}