import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admission from "@/lib/models/Admission";

// 🔴 Disable aggressive caching in Next.js App Router for the admin panel
export const dynamic = "force-dynamic";

/* -----------------------------------------
   🟦 GET — Fetch Admission by Slug
------------------------------------------*/
export async function GET(req, context) {
  try {
    // ✅ Always await DB connection INSIDE the function for Vercel/Serverless
    await connectDB();
    
    // ⭐ FIX: params MUST be awaited in Next.js 15 App Router
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "❌ Slug is required" },
        { status: 400 }
      );
    }

    const admission = await Admission.findOne({ slug }).lean();

    if (!admission) {
      return NextResponse.json(
        { message: "Admission not found" },
        { status: 404 }
      );
    }

    // ✅ Wrapped in { admission } to match what your frontend edit page expects
    return NextResponse.json({ success: true, admission }, { status: 200 });

  } catch (error) {
    console.error("🔥 Error fetching admission:", error);

    return NextResponse.json(
      {
        message: "❌ Error fetching admission",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟨 PUT — Update Admission by Slug (For Edit Page)
------------------------------------------*/
export async function PUT(req, context) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const body = await req.json();

    if (!slug) {
      return NextResponse.json({ message: "❌ Slug is required" }, { status: 400 });
    }

    // 🛡️ Data Sanitization for new arrays before passing to Mongoose
    if (body.keyDates && !Array.isArray(body.keyDates)) {
      body.keyDates = [];
    }
    
    if (body.importantLinks) {
      if (body.importantLinks.applyOnline && !Array.isArray(body.importantLinks.applyOnline)) {
        body.importantLinks.applyOnline = [];
      }
      if (body.importantLinks.downloadNotice && !Array.isArray(body.importantLinks.downloadNotice)) {
        body.importantLinks.downloadNotice = [];
      }
    }

    // findOneAndUpdate updates the document in MongoDB
    // { new: true } tells it to return the updated data instead of the old data
    // Note: Our Mongoose `pre('findOneAndUpdate')` hook will automatically handle 
    // slug generation and expiration status calculation.
    const updatedAdmission = await Admission.findOneAndUpdate(
      { slug }, // Find by the OLD slug in the URL
      body,     // Apply the new body data
      { new: true, runValidators: true }
    );

    if (!updatedAdmission) {
      return NextResponse.json({ message: "Admission not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "✅ Admission updated successfully", admission: updatedAdmission },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error updating admission:", error);

    // Handle duplicate slug error if user tries to manually change to a slug that already exists
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { message: "❌ This slug is already in use by another admission." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "❌ Error updating admission", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟥 DELETE — Delete Admission by Slug (For Manage Table)
------------------------------------------*/
export async function DELETE(req, context) {
  try {
    await connectDB();
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ message: "❌ Slug is required" }, { status: 400 });
    }

    const deletedAdmission = await Admission.findOneAndDelete({ slug });

    if (!deletedAdmission) {
      return NextResponse.json({ message: "Admission not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "✅ Admission deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error deleting admission:", error);
    return NextResponse.json(
      { message: "❌ Error deleting admission", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   ❌ Block Unsupported Methods
------------------------------------------*/
export function POST() {
  return NextResponse.json(
    { message: "POST not allowed on this endpoint. Use the base route." },
    { status: 405 }
  );
}