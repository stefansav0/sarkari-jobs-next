import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Result from "@/lib/models/Result";
import slugify from "slugify";

// Connect once globally
connectDB();

/* -----------------------------------------
   🟩 POST — Create New Result
------------------------------------------*/
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      title,
      shortInfo,
      link,
      date,
      postDate,
      examDate,
      resultDate,
      conductedBy,
      importantLinks,
      howToCheck,
    } = body;

    if (!title) {
      return NextResponse.json(
        { message: "❌ 'title' is required" },
        { status: 400 }
      );
    }

    const slug = slugify(title, { lower: true, strict: true });

    const result = new Result({
      title,
      shortInfo,
      link,
      date,
      postDate,
      examDate,
      resultDate,
      conductedBy,
      importantLinks,
      howToCheck,
      slug,
      publishDate: new Date(),
    });

    await result.save();

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
   🟦 GET — Paginated Results
------------------------------------------*/
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const results = await Result.find()
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Result.countDocuments();

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
