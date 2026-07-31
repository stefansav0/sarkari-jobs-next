import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AnswerKey from "@/lib/models/AnswerKey";

// 🔴 Disable aggressive caching in Next.js App Router
export const dynamic = "force-dynamic";

/* -----------------------------------------
   🟦 GET — List Answer Keys (Paginated)
------------------------------------------*/
export async function GET(req) {
  try {
    // ✅ Always await DB connection INSIDE the function for Vercel/Serverless
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const answerKeys = await AnswerKey.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AnswerKey.countDocuments();

    return NextResponse.json(
      {
        answerKeys,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching answer keys:", error);

    return NextResponse.json(
      { message: "❌ Error fetching answer keys", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟩 POST — Create New Answer Key
------------------------------------------*/
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // ✅ Explicitly extract fields to match the new frontend & schema structure
    const {
      title,
      slug,
      seoKeywords,
      metaDescription,
      conductedby,
      keyDates,
      howToCheck,
      publishDate,
      importantLinks,
    } = body;

    if (!title) {
      return NextResponse.json(
        { message: "❌ Title is required" },
        { status: 400 }
      );
    }

    // Mongoose handles the validation, slug sanitization, and saving via pre-save hooks
    const newAnswerKey = await AnswerKey.create({
      title,
      slug: slug || undefined, // Pass undefined if empty so Mongoose auto-generates it
      seoKeywords,
      metaDescription,
      conductedby,
      keyDates,
      howToCheck, // Safely saves the TipTap HTML string
      importantLinks,
      publishDate: publishDate || undefined, // Fallback to Date.now() if empty
    });

    return NextResponse.json(
      {
        message: "✅ Answer Key created successfully",
        answerKey: newAnswerKey,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error saving answer key:", error);

    // ✅ Catch Duplicate Slug Errors nicely
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { message: "❌ A post with this slug already exists. Please choose a unique URL." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "❌ Error saving answer key", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   ❌ Block unsupported methods
------------------------------------------*/
export function PUT() {
  return NextResponse.json(
    { message: "PUT not allowed on base route. Use /[slug] endpoint." },
    { status: 405 }
  );
}

export function DELETE() {
  return NextResponse.json(
    { message: "DELETE not allowed on base route. Use /[slug] endpoint." },
    { status: 405 }
  );
}