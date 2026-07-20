import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuestionPaper from "@/lib/models/QuestionPaper";

// Define the CORS headers to reuse in every response
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, replace "*" with your admin domain
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS: Handle CORS preflight requests from the browser
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET: Fetch all papers (Needed for the Admin Dashboard list view)
export async function GET() {
  try {
    await connectDB();
    const papers = await QuestionPaper.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(papers, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Failed to fetch papers:", error);
    return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500, headers: corsHeaders });
  }
}

// POST: Create a new paper
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Extract the new fields from the request body (replaced directUrl with links)
    const { 
      title, 
      slug, 
      category, 
      links, 
      coverImageUrl, 
      focusKeywords, 
      metaDescription, 
      fullDetails 
    } = body;

    // Create the document with the updated schema fields
    const newPaper = await QuestionPaper.create({
      title,
      slug,
      category,
      links,
      coverImageUrl,
      focusKeywords,
      metaDescription,
      fullDetails,
    });

    return NextResponse.json(newPaper, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    console.error("Failed to create paper:", error);
    
    // Handle duplicate slug error (MongoDB error code 11000)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A document with this title/slug already exists." }, 
        { status: 400, headers: corsHeaders }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create document" }, 
      { status: 500, headers: corsHeaders }
    );
  }
}