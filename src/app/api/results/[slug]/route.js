import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Result from "@/lib/models/Result";
import slugify from "slugify";

/* -----------------------------------------
   🟦 GET — Fetch Result by Slug
------------------------------------------*/
export async function GET(req, context) {
  try {
    await connectDB();
    
    // params MUST be awaited in Next.js 15 App Router
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "❌ Slug is required" },
        { status: 400 }
      );
    }

    const result = await Result.findOne({ slug }).lean();

    if (!result) {
      return NextResponse.json(
        { message: "Result not found" },
        { status: 404 }
      );
    }

    // Wrapped in { result } to match what the frontend axios request expects
    return NextResponse.json({ success: true, result }, { status: 200 });

  } catch (error) {
    console.error("🔥 Error fetching result:", error);

    return NextResponse.json(
      {
        message: "❌ Error fetching result",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟨 PUT — Update Result by Slug (For Edit Page)
------------------------------------------*/
export async function PUT(req, context) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const body = await req.json();

    if (!slug) {
      return NextResponse.json({ message: "❌ Slug is required" }, { status: 400 });
    }

    // Safely enforce URL-friendly formatting if the admin manually edited the slug
    if (body.slug) {
      body.slug = slugify(body.slug, { lower: true, strict: true });
    } else if (body.title) {
       // Fallback: If they cleared the slug but kept the title, regenerate it
      body.slug = slugify(body.title, { lower: true, strict: true });
    }

    // findOneAndUpdate updates the document in MongoDB
    // { new: true } tells it to return the updated data instead of the old data
    const updatedResult = await Result.findOneAndUpdate(
      { slug },
      body,
      { new: true, runValidators: true }
    );

    if (!updatedResult) {
      return NextResponse.json({ message: "Result not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "✅ Result updated successfully", result: updatedResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error updating result:", error);
    
    // Specifically catch unique index errors (like duplicate slugs being edited)
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "❌ A result with this Title or Slug already exists. Please choose a different slug." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "❌ Error updating result", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟥 DELETE — Delete Result by Slug (For Delete Button)
------------------------------------------*/
export async function DELETE(req, context) {
  try {
    await connectDB();
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ message: "❌ Slug is required" }, { status: 400 });
    }

    const deletedResult = await Result.findOneAndDelete({ slug });

    if (!deletedResult) {
      return NextResponse.json({ message: "Result not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "✅ Result deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error deleting result:", error);
    return NextResponse.json(
      { message: "❌ Error deleting result", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   ❌ Block Unsupported Methods
------------------------------------------*/
export function POST() {
  return NextResponse.json(
    { message: "POST not allowed on this endpoint" },
    { status: 405 }
  );
}