import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdmitCard from "@/lib/models/AdmitCard";

// Connect DB once
connectDB();

/* ----------------------------------------------
   🟦 GET – Fetch Single Admit Card by Slug
---------------------------------------------- */
export async function GET(req, context) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "❌ Slug is required" },
        { status: 400 }
      );
    }

    const admitCard = await AdmitCard.findOne({ slug });

    if (!admitCard) {
      return NextResponse.json(
        { message: "❌ Admit card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(admitCard, { status: 200 });

  } catch (err) {
    console.error("🔥 Error fetching admit card:", err);

    return NextResponse.json(
      { message: "❌ Server error", error: err.message },
      { status: 500 }
    );
  }
}

/* ----------------------------------------------
   ❌ Other Methods Not Allowed
---------------------------------------------- */
export function POST() {
  return NextResponse.json(
    { message: "POST not allowed" },
    { status: 405 }
  );
}
