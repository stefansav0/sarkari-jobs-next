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

    // 3. Find by slug and update. 
    // `new: true` returns the updated document.
    // `runValidators: true` ensures the new data follows your schema rules.
    const updatedDocument = await Document.findOneAndUpdate(
      { slug },
      body,
      { new: true, runValidators: true }
    );

    if (!updatedDocument) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { 
        message: "✅ Document updated successfully", 
        document: updatedDocument 
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Error updating document:", error);
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
    return NextResponse.json(
      {
        message: "❌ Error deleting document",
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}