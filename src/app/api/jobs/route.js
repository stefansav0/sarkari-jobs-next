import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { sendToAllUsers } from "@/lib/sendEmail";
import slugify from "slugify";

// GET /api/jobs
export async function GET() {
  try {
    await connectDB();
    const jobs = await Job.find().sort({ createdAt: -1 });

    return NextResponse.json({
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/jobs
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const slug = slugify(title, { lower: true, strict: true });
    const jobData = { ...body, slug };

    const job = new Job(jobData);
    await job.save();

    // Send email
    await sendToAllUsers({
      subject: `New Job Posted!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>📰 Finderight Jobs Notification</h2>
          <p>Hi {{name}},</p>
          <p>A new job has just been posted on <strong>Finderight</strong>:</p>
          <ul>
            <li><strong>📌 Title:</strong> ${job.title}</li>
            <li><strong>🏢 Department:</strong> ${job.department}</li>
            <li><strong>⏰ Last Date:</strong> ${new Date(job.lastDate).toISOString().split("T")[0]}</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/jobs/${job.department.toLowerCase()}/${job.slug}">
            👉 View Full Job Details
          </a>
          <p>Best,<br />Finderight Team</p>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Job created successfully", job },
      { status: 201 }
    );
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create job", error: error.message },
      { status: 422 }
    );
  }
}
