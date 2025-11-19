import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AnswerKey from "@/lib/models/AnswerKey";

// ✅ Connect DB once globally
connectDB();

/* -----------------------------------------
   🟦 GET — Fetch Answer Key by Slug
------------------------------------------*/
export async function GET(req, context) {
  try {
    // ⭐ FIX: params must be awaited
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "❌ Slug is required" },
        { status: 400 }
      );
    }

    const answerKey = await AnswerKey.findOne({ slug });

    if (!answerKey) {
      return NextResponse.json(
        { message: "Answer key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(answerKey, { status: 200 });

  } catch (error) {
    console.error("🔥 Error fetching answer key:", error);

    return NextResponse.json(
      {
        message: "❌ Error fetching answer key",
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
