import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admission from "@/lib/models/Admission";

// Connect to MongoDB once
connectDB();

/* -----------------------------------------
   🟦 GET — Fetch Admission by Slug
------------------------------------------*/
export async function GET(req, { params }) {
  try {
    const { slug } = params; // ← App Router reads slug here

    if (!slug) {
      return NextResponse.json(
        { message: "❌ Slug is required" },
        { status: 400 }
      );
    }

    const admission = await Admission.findOne({ slug });

    if (!admission) {
      return NextResponse.json(
        { message: "Admission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(admission, { status: 200 });

  } catch (error) {
    console.error("🔥 Error fetching admission:", error);

    return NextResponse.json(
      {
        message: "❌ Error fetching admission",
        error: error.message
      },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   ❌ Block Other Methods
------------------------------------------*/
export function POST() {
  return NextResponse.json(
    { message: "POST not allowed for this route" },
    { status: 405 }
  );
}
