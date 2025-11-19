import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Result from "@/lib/models/Result";


// Connect DB once
connectDB();

/* -----------------------------------------
   🟦 GET — Fetch Result by Slug
------------------------------------------*/
export async function GET(req, { params }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { message: "❌ Slug is required" },
        { status: 400 }
      );
    }

    const result = await Result.findOne({ slug });

    if (!result) {
      return NextResponse.json(
        { message: "Result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("🔥 Error fetching result:", error);

    return NextResponse.json(
      {
        message: "❌ Error fetching result",
        error: error.message
      },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   ❌ Block Unsupported Methods
------------------------------------------*/
export function POST() {
  return NextResponse.json(
    { message: "POST not allowed" },
    { status: 405 }
  );
}
