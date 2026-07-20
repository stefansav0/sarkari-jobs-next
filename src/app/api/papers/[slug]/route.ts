import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuestionPaper from "@/lib/models/QuestionPaper";

// Define the CORS headers to reuse in every response
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Change "*" to your admin domain in production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS: Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET a single paper by slug
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    await connectDB();
    const paper = await QuestionPaper.findOne({ slug: slug });
    
    if (!paper) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }
    
    return NextResponse.json(paper, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

// UPDATE a paper by slug
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    await connectDB();
    const body = await request.json();
    
    const updatedPaper = await QuestionPaper.findOneAndUpdate(
      { slug: slug }, 
      body, 
      { 
        new: true,           // Returns the updated document instead of the old one
        runValidators: true  // Ensures required fields (like category, links) are not bypassed during edit
      } 
    );
    
    if (!updatedPaper) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }
    
    return NextResponse.json(updatedPaper, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error("Error updating document:", error);
    
    // Catch duplicate slug errors during edit
    if (error.code === 11000) {
      return NextResponse.json({ error: "Another document already uses this slug." }, { status: 400, headers: corsHeaders });
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

// DELETE a paper by slug
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    await connectDB();
    
    const deletedPaper = await QuestionPaper.findOneAndDelete({ slug: slug });
    
    if (!deletedPaper) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }
    
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}