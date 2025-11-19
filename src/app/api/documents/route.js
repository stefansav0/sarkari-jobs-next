import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Document from "@/lib/models/Document";
import slugify from "slugify";

// Connect once globally
connectDB();

/* -----------------------------------------
   🟦 GET — Paginated Documents
------------------------------------------*/
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const documents = await Document.find()
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments();

    return NextResponse.json(
      {
        documents,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching documents:", error);

    return NextResponse.json(
      { message: "❌ Error fetching documents", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟩 POST — Create New Document
------------------------------------------*/
export async function POST(req) {
  try {
    const body = await req.json();
    const { title, ...rest } = body;

    if (!title) {
      return NextResponse.json(
        { message: "❌ Title is required" },
        { status: 400 }
      );
    }

    const document = new Document({
      title,
      slug: slugify(title, { lower: true, strict: true }),
      ...rest,
    });

    await document.save();

    return NextResponse.json(
      {
        message: "✅ Document created successfully",
        document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error saving document:", error);

    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { message: "❌ Slug already exists. Try a different title." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "❌ Error saving document", error: error.message },
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
