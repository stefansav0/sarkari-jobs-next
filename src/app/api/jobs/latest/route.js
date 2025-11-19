import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";

// GET /api/jobs/latest
export async function GET() {
  try {
    await connectDB();

    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("❌ Error fetching latest jobs:", error);
    return NextResponse.json(
      {
        error: "Server Error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
