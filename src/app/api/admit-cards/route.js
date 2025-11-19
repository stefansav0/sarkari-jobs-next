import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdmitCard from "@/lib/models/AdmitCard";
import slugify from "slugify";

// Connect to DB once
connectDB();

/* -----------------------------------------
   🟦 GET — List Admit Cards (Paginated)
------------------------------------------*/
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const admitCards = await AdmitCard.find()
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);

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
    };

    const admitCard = new AdmitCard(data);
    await admitCard.save();

    return NextResponse.json(
      {
        message: "✅ Admit Card created successfully",
        admitCard,
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
