import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";

// =======================
// GET /api/jobs/[slug]
// =======================
export async function GET(req, context) {
  try {
    await connectDB();

    // ✅ FIX: params is async in Next.js 15
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    const job = await Job.findOne({ slug }).lean();

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        job,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching job:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// =======================
// DELETE /api/jobs/[slug]
// =======================
export async function DELETE(req, context) {
  try {
    await connectDB();

    // ✅ FIX: params is async in Next.js 15
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    const deletedJob = await Job.findOneAndDelete({ slug });

    if (!deletedJob) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Job deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting job:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
