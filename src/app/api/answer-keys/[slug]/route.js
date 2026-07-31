import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AnswerKey from "@/lib/models/AnswerKey";

/* -----------------------------------------
   🟦 GET — Fetch Answer Key by Slug
------------------------------------------*/
export async function GET(req, context) {
  try {
    // ✅ Always await DB connection INSIDE the function for Vercel/Serverless
    await connectDB();
    
    // params MUST be awaited in Next.js 15 App Router
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "❌ Slug is required" },
        { status: 400 }
      );
    }

    const answerKey = await AnswerKey.findOne({ slug }).lean();

    if (!answerKey) {
      return NextResponse.json(
        { message: "Answer key not found" },
        { status: 404 }
      );
    }

    // ✅ Wrapped in { answerKey } to match what your frontend expects
    return NextResponse.json({ success: true, answerKey }, { status: 200 });

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
   🟨 PUT — Update Answer Key by Slug (For Edit Page)
------------------------------------------*/
export async function PUT(req, context) {
  try {
    await connectDB();
    
    // Grab the current slug from the URL parameters
    const { slug: currentSlug } = await context.params;
    const body = await req.json();

    if (!currentSlug) {
      return NextResponse.json({ message: "❌ Slug is required" }, { status: 400 });
    }

    // ✅ Explicitly extract fields to match the new schema
    const {
      title,
      slug: newSlug,
      seoKeywords,
      metaDescription,
      conductedby,
      keyDates,
      howToCheck,
      publishDate,
      importantLinks,
    } = body;

    // Construct the payload of what actually needs updating
    const updateData = {
      title,
      slug: newSlug || currentSlug, // Use the new slug if provided, otherwise keep the old one
      seoKeywords,
      metaDescription,
      conductedby,
      keyDates,
      howToCheck,
      publishDate,
      importantLinks,
    };

    // findOneAndUpdate updates the document in MongoDB
    // { new: true } tells it to return the updated data instead of the old data
    const updatedAnswerKey = await AnswerKey.findOneAndUpdate(
      { slug: currentSlug },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAnswerKey) {
      return NextResponse.json({ message: "Answer key not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "✅ Answer Key updated successfully", answerKey: updatedAnswerKey },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error updating answer key:", error);

    // ✅ Catch Duplicate Slug Errors nicely during updates
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { message: "❌ A post with this slug already exists. Please choose a unique URL." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "❌ Error updating answer key", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟥 DELETE — Delete Answer Key by Slug (For Manage Table)
------------------------------------------*/
export async function DELETE(req, context) {
  try {
    await connectDB();
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ message: "❌ Slug is required" }, { status: 400 });
    }

    const deletedAnswerKey = await AnswerKey.findOneAndDelete({ slug });

    if (!deletedAnswerKey) {
      return NextResponse.json({ message: "Answer key not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "✅ Answer Key deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error deleting answer key:", error);
    return NextResponse.json(
      { message: "❌ Error deleting answer key", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   ❌ Block Unsupported Methods
------------------------------------------*/
export function POST() {
  return NextResponse.json(
    { message: "POST not allowed on this endpoint. Use the base route." },
    { status: 405 }
  );
}