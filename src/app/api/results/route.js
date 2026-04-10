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

    // ✅ Extracted EXACTLY what the new AdminAddResult frontend form sends
    const {
      title,
      conductedBy,
      examDate,
      resultDate,
      postDate,
      shortInfo,
      howToCheck,
      importantLinks,
    } = body;

    if (!title) {
      return NextResponse.json(
        { message: "❌ 'title' is required" },
        { status: 400 }
      );
    }

    const slug = slugify(title, { lower: true, strict: true });

    const result = await Result.create({
      title,
      conductedBy,
      examDate,
      resultDate,
      postDate,
      shortInfo,
      howToCheck,
      importantLinks,
      slug, // Mongoose also has a pre-save hook for this, but explicitly passing it is perfectly safe
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

    return NextResponse.json(
      { message: "❌ Error saving result", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟦 GET — Paginated Results (FIXED SORT)
------------------------------------------*/
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const results = await Result.find({})
      // ✅ FIX: sort by createdAt (ALL documents have this)
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