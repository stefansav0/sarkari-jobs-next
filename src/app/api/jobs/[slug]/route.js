import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";

// GET /api/jobs/[slug]
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { message: "Slug is required" },
        { status: 400 }
      );
    }

    const job = await Job.findOne({ slug }).lean();

    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("❌ Error fetching job:", error);
    return NextResponse.json(
      {
        message: "Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
