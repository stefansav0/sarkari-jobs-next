import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admission from "@/lib/models/Admission";
import slugify from "slugify";

// 🔴 Disable aggressive caching in Next.js App Router for the admin panel
export const dynamic = "force-dynamic";

/* -----------------------------------------
   🟦 GET — Fetch Admissions (Paginated)
------------------------------------------*/
export async function GET(req) {
  try {
    // ✅ Always await DB connection INSIDE the function for Vercel/Serverless
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const admissions = await Admission.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // .lean() makes it faster by returning plain JSON objects

    const total = await Admission.countDocuments();

    return NextResponse.json(
      {
        message: "✅ Admissions fetched successfully",
        admissions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 GET Admissions Error:", error);
    return NextResponse.json(
      { message: "❌ Failed to fetch admissions.", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟩 POST — Create Admission
------------------------------------------*/
export async function POST(req) {
  try {
    // ✅ Always await DB connection
    await connectDB();

    const body = await req.json();
    console.log("📩 Incoming POST body:", body);

    const {
      title = "",
      conductedBy = "",
      eligibility = "",
      ageLimit = "",
      course = "",
      applicationFee = "",
      fullCourseDetails = "",
      examDate = "",
      publishDate = "",
      applicationBegin = "",
      lastDateApply = "",
      admissionDate = "",
      importantLinks = {},
    } = body;

    // === Validation ===
    if (!title.trim()) {
      return NextResponse.json(
        { message: "❌ 'title' field is required." },
        { status: 400 }
      );
    }
    if (!conductedBy.trim()) {
      return NextResponse.json(
        { message: "❌ 'conductedBy' field is required." },
        { status: 400 }
      );
    }

    // === Generate slug ===
    const slug = slugify(title, { lower: true, strict: true });

    // === Create admission ===
    const admission = new Admission({
      title: title.trim(),
      slug,
      conductedBy: conductedBy.trim(),
      eligibility,
      ageLimit,
      course,
      applicationFee,
      fullCourseDetails,
      examDate,
      publishDate,
      applicationBegin,
      lastDateApply,
      admissionDate,
      // ✅ Handle the new multiple-link arrays safely
      importantLinks: {
        applyOnline: Array.isArray(importantLinks.applyOnline) ? importantLinks.applyOnline : [],
        downloadNotice: Array.isArray(importantLinks.downloadNotice) ? importantLinks.downloadNotice : [],
        officialWebsite: importantLinks.officialWebsite || "",
      },
    });

    await admission.save();

    return NextResponse.json(
      {
        message: "✅ Admission created successfully!",
        admission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("🔥 POST Admission Error:", error);

    // Duplicate slug
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { message: "❌ Slug already exists. Try a different title." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "❌ Server error while creating admission.", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   ❌ Deny Other Methods (PUT / DELETE)
------------------------------------------*/
export function PUT() {
  return NextResponse.json(
    { message: "Method PUT Not Allowed on base route. Use /[slug] endpoint." },
    { status: 405 }
  );
}
export function DELETE() {
  return NextResponse.json(
    { message: "Method DELETE Not Allowed on base route. Use /[slug] endpoint." },
    { status: 405 }
  );
}