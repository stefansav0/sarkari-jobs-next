import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { sendToAllUsers } from "@/lib/sendEmail";
import slugify from "slugify";
import { put } from "@vercel/blob";
import { waitUntil } from "@vercel/functions"; // ✅ Added to prevent Vercel timeouts

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

    // 1. Parse FormData
    const formData = await req.formData();
    const title = formData.get("title");

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    // 2. Extract standard text fields (Updated with new SEO & Text fields)
    const rawSlug = formData.get("slug") || "";
    // If a custom slug is provided, slugify it for URL safety, else fallback to title
    const slug = rawSlug 
      ? slugify(rawSlug, { lower: true, strict: true }) 
      : slugify(title, { lower: true, strict: true });

    const department = formData.get("department") || "";
    const category = formData.get("category") || "";
    const description = formData.get("description") || "";
    const eligibility = formData.get("eligibility") || "";
    const ageLimit = formData.get("ageLimit") || "";
    const applicationFee = formData.get("applicationFee") || "";
    const vacancy = formData.get("vacancy") || "";
    const lastDate = formData.get("lastDate") || ""; // Now treated as free-text string
    
    const seoKeywords = formData.get("seoKeywords") || "";
    const metaDescription = formData.get("metaDescription") || "";

    // 3. Parse JSON strings back into objects/arrays
    const importantDates = JSON.parse(formData.get("importantDates") || "{}");
    const officialWebsite = formData.get("officialWebsite") || "";
    const applyOnline = JSON.parse(formData.get("applyOnline") || "[]");
    
    // Parse the notification metadata
    const parsedNotifications = JSON.parse(formData.get("downloadNotification") || "[]");
    const finalDownloadNotifications = [];

    // 4. Handle File Uploads for Notifications using Vercel Blob
    for (const item of parsedNotifications) {
      if (item.isUploadedFile && item.fileKey) {
        // Retrieve the actual file from FormData using the fileKey
        const file = formData.get(item.fileKey);
        
        if (file && typeof file === "object") {
          
          // Create a clean, unique filename to prevent overwriting
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const safeFilename = `${uniqueSuffix}-${file.name.replace(/\s+/g, "_")}`;

          // ✅ Upload directly to Vercel Blob
          const blob = await put(`notifications/${safeFilename}`, file, {
            access: 'public',
          });

          // Save the permanent public URL returned by Vercel Blob
          finalDownloadNotifications.push({
            label: item.label,
            url: blob.url 
          });
        }
      } else {
        // Standard URL link (No file uploaded)
        finalDownloadNotifications.push({
          label: item.label,
          url: item.url
        });
      }
    }

    // 5. Construct the final data object for MongoDB
    const jobData = {
      title,
      slug,
      department,
      category,
      description,
      eligibility,
      ageLimit,
      applicationFee,
      vacancy,
      lastDate,
      seoKeywords,
      metaDescription,
      importantDates,
      importantLinks: {
        applyOnline,
        downloadNotification: finalDownloadNotifications,
        officialWebsite,
      }
    };

    // 6. Save to Database
    const job = new Job(jobData);
    await job.save();

    // 7. Send email in the background using waitUntil
    // NOTE: We remove 'await' here so the API responds to the client immediately
    waitUntil(
      sendToAllUsers({
        subject: `New Job Posted: ${job.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>📰 Finderight Jobs Notification</h2>
            <p>Hi {{name}},</p>
            <p>A new job has just been posted on <strong>Finderight</strong>:</p>
            <ul>
              <li><strong>📌 Title:</strong> ${job.title}</li>
              <li><strong>🏢 Department:</strong> ${job.department}</li>
              <li><strong>⏰ Last Date:</strong> ${job.lastDate}</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/jobs/${job.slug}">
              👉 View Full Job Details
            </a>
            <p>Best,<br />Finderight Team</p>
          </div>
        `,
      })
      .then(() => console.log("✅ Background job emails sent successfully"))
      .catch((err) => console.error("❌ Background job email failed:", err))
    );

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