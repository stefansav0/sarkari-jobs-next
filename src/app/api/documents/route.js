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
    
    // 2. Look for filters in the URL 
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("search"); // NEW: Added search support

    // 3. Build the MongoDB query object
    const query = {};
    
    if (category && category !== "All") {
      query.category = category;
    }

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { slug: { $regex: searchQuery, $options: "i" } }
      ];
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
        totalDocuments: total
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

    // 2. Clean up empty slug so Mongoose pre-validate hook can auto-generate it from the title
    if (body.slug !== undefined && body.slug.trim() === "") {
      delete body.slug;
    }

    // 3. Mongoose automatically extracts all new fields (coverImageUrl, contentFormat, etc.)
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

    // Handle missing required fields (like title, link, or category) gracefully
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: "❌ Validation failed. Check required fields.", error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fallback for duplicate slugs (Updated to reflect manual slug UI)
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { message: "❌ Slug already exists. Try changing the URL Slug or Title." },
        { status: 409, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "❌ Error saving document", error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}