import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdmitCard from "@/lib/models/AdmitCard";
import slugify from "slugify";

// 🔴 Disable aggressive caching in Next.js App Router
export const dynamic = "force-dynamic";

/* -----------------------------------------
   🟦 GET — List Admit Cards (Paginated)
------------------------------------------*/
export async function GET(req) {
  try {
    // ✅ Always await DB connection INSIDE the function for Vercel/Serverless
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const admitCards = await AdmitCard.find()
      .sort({ createdAt: -1 }) // Sorted by newest first
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AdmitCard.countDocuments();

    return NextResponse.json(
      {
        admitCards,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching admit cards:", error);

    return NextResponse.json(
      { message: "❌ Error fetching admit cards", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟩 POST — Create New Admit Card
------------------------------------------*/
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // ✅ Explicitly extract fields to ensure clean data matching the new frontend
    const {
      title,
      conductedby,
      examDate,
      applicationBegin,
      lastDateApply,
      admitCard,
      publishDate,
      description,
      howToDownload,
      importantLinks,
    } = body;

    if (!title) {
      return NextResponse.json(
        { message: "❌ Title is required" },
        { status: 400 }
      );
    }

    const slug = slugify(title, { lower: true, strict: true });

    // Mongoose handles the validation and saving
    const newAdmitCard = await AdmitCard.create({
      title,
      slug,
      conductedby,
      examDate,
      applicationBegin,
      lastDateApply,
      admitCard,
      publishDate,
      description,
      howToDownload,
      importantLinks,
    });

    return NextResponse.json(
      {
        message: "✅ Admit Card created successfully",
        admitCard: newAdmitCard,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error saving admit card:", error);

    return NextResponse.json(
      { message: "❌ Error saving admit card", error: error.message },
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