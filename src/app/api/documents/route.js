import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Document from "@/lib/models/Document";

// CORS headers (Prevents Axios network blocks from separate admin panels)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/* -----------------------------------------
   🟨 OPTIONS — Preflight Request for CORS
------------------------------------------*/
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/* -----------------------------------------
   🟦 GET — Paginated & Filtered Documents
------------------------------------------*/
export async function GET(req) {
  try {
    // 1. Await connection inside the handler for serverless stability
    await connectDB(); 

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    // 2. Look for a category filter in the URL (e.g., ?page=1&category=Aadhaar)
    const category = searchParams.get("category");

    // 3. Build the MongoDB query object
    const query = {};
    if (category && category !== "All") {
      query.category = category;
    }

    // 4. Apply the query to both the find() and countDocuments() methods
    const documents = await Document.find(query)
      .sort({ publishDate: -1 }) // Make sure newest docs show up first
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments(query);

    return NextResponse.json(
      {
        documents,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Error fetching documents:", error);

    return NextResponse.json(
      { message: "❌ Error fetching documents", error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* -----------------------------------------
   🟩 POST — Create New Document
------------------------------------------*/
export async function POST(req) {
  try {
    // 1. Await connection
    await connectDB(); 
    
    const body = await req.json();

    // 2. Mongoose will automatically extract the new fullDescription, metaDescription, 
    // and seoKeywords from the body based on your updated schema!
    const document = new Document(body);

    await document.save();

    return NextResponse.json(
      {
        message: "✅ Document created successfully",
        document,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Error saving document:", error);

    // Handle missing required fields (like title or category) gracefully
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: "❌ Validation failed. Check required fields.", error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fallback for duplicate slugs
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { message: "❌ Slug already exists. Try a different title." },
        { status: 409, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "❌ Error saving document", error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}