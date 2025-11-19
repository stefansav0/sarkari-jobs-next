import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AnswerKey from "@/lib/models/AnswerKey";
import slugify from "slugify";

// Connect once globally
connectDB();

/* -----------------------------------------
   🟦 GET — List Answer Keys (Paginated)
------------------------------------------*/
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const answerKeys = await AnswerKey.find()
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);

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
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json(
        { message: "❌ Title is required" },
        { status: 400 }
      );
    }

    const data = {
      ...body,
      slug: slugify(body.title, { lower: true, strict: true }),
      departmentSlug: slugify(body.department || "", { lower: true, strict: true }),
    };

    const answerKey = new AnswerKey(data);
    await answerKey.save();

    return NextResponse.json(
      {
        message: "✅ Answer Key created successfully",
        answerKey,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error saving answer key:", error);

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
