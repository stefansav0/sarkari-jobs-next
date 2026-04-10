import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdmitCard from "@/lib/models/AdmitCard";

/* -----------------------------------------
   🟦 GET — Fetch Admit Card by Slug
------------------------------------------*/
export async function GET(req, context) {
  try {
    await connectDB();
    
    // params MUST be awaited in Next.js 15 App Router
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "❌ Slug is required" },
        { status: 400 }
      );
    }

    const admitCard = await AdmitCard.findOne({ slug }).lean();

    if (!admitCard) {
      return NextResponse.json(
        { message: "Admit card not found" },
        { status: 404 }
      );
    }

    // Wrapped in { admitCard } to match what the frontend axios request expects
    return NextResponse.json({ success: true, admitCard }, { status: 200 });

  } catch (error) {
    console.error("🔥 Error fetching admit card:", error);

    return NextResponse.json(
      {
        message: "❌ Error fetching admit card",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟨 PUT — Update Admit Card by Slug (For Edit Page)
------------------------------------------*/
export async function PUT(req, context) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const body = await req.json();

    if (!slug) {
      return NextResponse.json({ message: "❌ Slug is required" }, { status: 400 });
    }

    // findOneAndUpdate updates the document in MongoDB
    // { new: true } tells it to return the updated data instead of the old data
    const updatedAdmitCard = await AdmitCard.findOneAndUpdate(
      { slug },
      body,
      { new: true, runValidators: true }
    );

    if (!updatedAdmitCard) {
      return NextResponse.json({ message: "Admit card not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "✅ Admit Card updated successfully", admitCard: updatedAdmitCard },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error updating admit card:", error);
    return NextResponse.json(
      { message: "❌ Error updating admit card", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟥 DELETE — Delete Admit Card by Slug (For Manage Table)
------------------------------------------*/
export async function DELETE(req, context) {
  try {
    await connectDB();
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ message: "❌ Slug is required" }, { status: 400 });
    }

    const deletedAdmitCard = await AdmitCard.findOneAndDelete({ slug });

    if (!deletedAdmitCard) {
      return NextResponse.json({ message: "Admit card not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "✅ Admit Card deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error deleting admit card:", error);
    return NextResponse.json(
      { message: "❌ Error deleting admit card", error: error.message },
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