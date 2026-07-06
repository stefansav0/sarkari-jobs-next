import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Result from "@/lib/models/Result";
import slugify from "slugify";

/* 🔴 Disable caching (App Router) */
export const dynamic = "force-dynamic";

/* -----------------------------------------
   🟩 POST — Create New Result
------------------------------------------*/
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // ✅ Extracted EXACTLY what the new AdminAddResult frontend and updated model expects
    const {
      title,
      slug,             // Now accepting the manual/auto-generated slug from the frontend
      seoKeywords,      // New SEO field
      metaDescription,  // New SEO field
      conductedBy,
      examDate,
      resultDate,
      postDate,
      detailedHtml,     // Replaces shortInfo
      howToCheck,
      importantLinks,
    } = body;

    if (!title) {
      return NextResponse.json(
        { message: "❌ 'title' is required" },
        { status: 400 }
      );
    }
    
    if (!detailedHtml) {
      return NextResponse.json(
        { message: "❌ 'detailedHtml' is required for the notice body" },
        { status: 400 }
      );
    }

    // Use the frontend slug if provided, otherwise generate it. 
    // We pass it through slugify again just to ensure it is URL-safe if manually typed.
    const finalSlug = slug 
      ? slugify(slug, { lower: true, strict: true }) 
      : slugify(title, { lower: true, strict: true });

    const result = await Result.create({
      title,
      slug: finalSlug,
      seoKeywords,
      metaDescription,
      conductedBy,
      examDate,
      resultDate,
      postDate,
      detailedHtml,
      howToCheck,
      importantLinks,
    });

    return NextResponse.json(
      {
        message: "✅ Result created successfully",
        result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error saving result:", error);

    // Specifically catch unique index errors (like duplicate slugs)
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "❌ A result with this Title or Slug already exists. Please change the URL Slug." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "❌ Error saving result", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟦 GET — Paginated Results
------------------------------------------*/
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const results = await Result.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Result.countDocuments({});

    return NextResponse.json(
      {
        results,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching results:", error);

    return NextResponse.json(
      { message: "❌ Error fetching results", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   ❌ Block Unsupported Methods
------------------------------------------*/
export function PUT() {
  return NextResponse.json(
    { message: "PUT not allowed" },
    { status: 405 }
  );
}

export function DELETE() {
  return NextResponse.json(
    { message: "DELETE not allowed" },
    { status: 405 }
  );
}