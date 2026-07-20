import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import slugify from "slugify";
import { put } from "@vercel/blob";

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

    // Return the job directly at the root so the frontend can easily destructure it 
    // (e.g., res.data.title, res.data.department)
    return NextResponse.json(job, { status: 200 });

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
// PUT /api/jobs/[slug]
// =======================
export async function PUT(req, context) {
  try {
    await connectDB();
    const { slug: originalSlug } = await context.params;

    if (!originalSlug) {
      return NextResponse.json(
        { message: "Original slug is required" },
        { status: 400 }
      );
    }

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
    const newSlug = rawSlug 
      ? slugify(rawSlug, { lower: true, strict: true }) 
      : slugify(title, { lower: true, strict: true });

    const department = formData.get("department") || "";
    const category = formData.get("category") || "";
    const description = formData.get("description") || "";
    const eligibility = formData.get("eligibility") || "";
    const ageLimit = formData.get("ageLimit") || "";
    const applicationFee = formData.get("applicationFee") || "";
    const vacancy = formData.get("vacancy") || "";
    const lastDate = formData.get("lastDate") || ""; 
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
        // Retrieve the actual new file from FormData using the fileKey
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
        // Standard URL link (No new file uploaded, keep existing URL)
        finalDownloadNotifications.push({
          label: item.label,
          url: item.url
        });
      }
    }

    // 5. Construct the final data object for MongoDB
    const jobData = {
      title,
      slug: newSlug,
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

    // 6. Update Database
    const updatedJob = await Job.findOneAndUpdate(
      { slug: originalSlug }, 
      jobData, 
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return NextResponse.json(
        { success: false, message: "Job not found to update" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Job updated successfully", job: updatedJob },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating job:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update job", error: error.message },
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