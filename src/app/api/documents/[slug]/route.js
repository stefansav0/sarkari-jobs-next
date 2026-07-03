import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Document from "@/lib/models/Document";

// CORS (required for PUT, DELETE, and GET from other domains)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// --- OPTIONS (Preflight) ---
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// --- GET DOCUMENT BY SLUG ---
export async function GET(req, { params }) {
  try {
    await connectDB();

    // 1. Await params before destructuring (Next.js 15 requirement)
    const { slug } = await params;

    const document = await Document.findOne({ slug });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(document, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("❌ Error fetching document:", error);
    return NextResponse.json(
      {
        message: "❌ Error fetching document",
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// --- PUT (UPDATE) DOCUMENT BY SLUG ---
export async function PUT(req, { params }) {
  try {
    await connectDB();

    // 1. Await params before destructuring
    const { slug } = await params;
    
    // 2. Parse the incoming JSON body containing the edits
    const body = await req.json();

    // 3. Find the existing document
    const document = await Document.findOne({ slug });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 4. Handle Slug Auto-generation intent on update
    // If the frontend sends an empty slug, it means we want to auto-generate a new one from the title
    if (body.slug !== undefined && body.slug.trim() === "") {
      delete body.slug;          // Remove from the body payload
      document.slug = undefined; // Clear it on the document so Mongoose hook regenerates it
    }

    // 5. Apply the updates to the document object
    Object.assign(document, body);

    // 6. Use .save() instead of findOneAndUpdate to ensure the pre('validate') schema hook fires!
    await document.save();

    return NextResponse.json(
      { 
        message: "✅ Document updated successfully", 
        document 
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Error updating document:", error);

    // Handle duplicate slug errors on update
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { message: "❌ Slug already exists. Try changing the URL Slug or Title." },
        { status: 409, headers: corsHeaders }
      );
    }

    // Handle validation errors (e.g., clearing a required field)
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: "❌ Validation failed. Check required fields.", error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        message: "❌ Error updating document",
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// --- DELETE DOCUMENT BY SLUG ---
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    // 1. Await params before destructuring
    const { slug } = await params;

    const deleted = await Document.findOneAndDelete({ slug });

    if (!deleted) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "Document deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Error deleting document:", error);
    return NextResponse.json(
      {
        message: "❌ Error deleting document",
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}