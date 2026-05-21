import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StudyNews from "@/lib/models/StudyNews";
import slugify from "slugify";

// Ensure DB Connection
connectDB();

/* =========================================
   🟦 GET — Fetch Single News By Slug
========================================= */
export async function GET(
  req: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "❌ Slug is required",
        },
        { status: 400 }
      );
    }

    const newsItem =
      await StudyNews.findOne({
        slug,
      });

    if (!newsItem) {
      return NextResponse.json(
        {
          success: false,
          message:
            "❌ Study news not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        news: newsItem,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "🔥 Error fetching study news:",
      message
    );

    return NextResponse.json(
      {
        success: false,
        message: "❌ Server error",
        error: message,
      },
      { status: 500 }
    );
  }
}

/* =========================================
   🟨 PATCH — UPDATE NEWS
========================================= */
export async function PATCH(
  req: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "❌ Slug is required",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      title,
      description,

      coverImage,
      imageUrl,

      author,

      seoTitle,
      metaDescription,

      keywords,

      visibility,
    } = body;

    // Find existing news
    const existingNews =
      await StudyNews.findOne({
        slug,
      });

    if (!existingNews) {
      return NextResponse.json(
        {
          success: false,
          message:
            "❌ Study news not found",
        },
        { status: 404 }
      );
    }

    /* =========================================
       GENERATE NEW SLUG
    ========================================= */
    let updatedSlug =
      existingNews.slug;

    if (
      title &&
      title !== existingNews.title
    ) {
      updatedSlug = slugify(title, {
        lower: true,
        strict: true,
      });

      // Check duplicate slug
      const duplicate =
        await StudyNews.findOne({
          slug: updatedSlug,
          _id: { $ne: existingNews._id },
        });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message:
              "❌ Another article already uses this slug/title",
          },
          { status: 400 }
        );
      }
    }

    /* =========================================
       KEYWORDS
    ========================================= */
    let keywordsArray = [];

    if (typeof keywords === "string") {
      keywordsArray = keywords
        .split(",")
        .map((k: string) =>
          k.trim()
        )
        .filter(Boolean);
    } else if (
      Array.isArray(keywords)
    ) {
      keywordsArray = keywords;
    }

    /* =========================================
       UPDATE NEWS
    ========================================= */
    const updatedNews =
      await StudyNews.findOneAndUpdate(
        { slug },
        {
          title:
            title ||
            existingNews.title,

          slug: updatedSlug,

          description:
            description ||
            existingNews.description,

          coverImage:
            coverImage ??
            existingNews.coverImage,

          imageUrl:
            imageUrl ??
            existingNews.imageUrl,

          author:
            author ||
            existingNews.author,

          seoTitle:
            seoTitle ||
            existingNews.seoTitle,

          metaDescription:
            metaDescription ||
            existingNews.metaDescription,

          keywords:
            keywordsArray.length > 0
              ? keywordsArray
              : existingNews.keywords,

          visibility:
            visibility ||
            existingNews.visibility,
        },
        {
          new: true,
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "✅ Study news updated successfully",

        news: updatedNews,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "🔥 Error updating study news:",
      message
    );

    return NextResponse.json(
      {
        success: false,
        message: "❌ Server error",
        error: message,
      },
      { status: 500 }
    );
  }
}

/* =========================================
   🟥 DELETE — Delete By Slug
========================================= */
export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "❌ Slug is required",
        },
        { status: 400 }
      );
    }

    const deletedNews =
      await StudyNews.findOneAndDelete({
        slug,
      });

    if (!deletedNews) {
      return NextResponse.json(
        {
          success: false,
          message:
            "❌ Study news not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "✅ Study news deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "🔥 Error deleting study news:",
      message
    );

    return NextResponse.json(
      {
        success: false,
        message: "❌ Server error",
        error: message,
      },
      { status: 500 }
    );
  }
}

/* =========================================
   ❌ BLOCK UNSUPPORTED METHODS
========================================= */
export function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        "❌ POST method not allowed",
    },
    { status: 405 }
  );
}

export function PUT() {
  return NextResponse.json(
    {
      success: false,
      message:
        "❌ PUT method not allowed. Use PATCH instead.",
    },
    { status: 405 }
  );
}