import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StudyNews from "@/lib/models/StudyNews";
import slugify from "slugify";
import { sendToAllUsers } from "@/lib/sendEmail";

// Connect DB
connectDB();

/* =========================================
   TYPES
========================================= */
interface StudyNewsRequestBody {
  title: string;
  description: string;

  slug?: string;

  coverImage?: string;
  imageUrl?: string;

  author?: string;

  seoTitle?: string;
  metaDescription?: string;

  keywords?: string[] | string;

  visibility?: "draft" | "published";
}

/* =========================================
   HELPERS
========================================= */

// Remove HTML
function stripHtml(html: string): string {
  if (!html) return "";

  let text = html;

  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<[^>]*>?/gm, "");

  text = text.replace(/&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&lt;/gi, "<");

  return text.replace(/\s+/g, " ").trim();
}

// Create description snippet
function createSnippet(text: string, maxLength: number = 200) {
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);

  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/* =========================================
   🟩 POST — CREATE NEWS
========================================= */
export async function POST(req: Request) {
  try {
    const body: StudyNewsRequestBody = await req.json();

    const {
      title,
      description,
      slug,
      coverImage,
      imageUrl,
      author,

      seoTitle,
      metaDescription,
      keywords,

      visibility,
    } = body;

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        {
          message: "❌ Title & Description are required",
        },
        { status: 400 }
      );
    }

    // Generate slug
    const generatedSlug = slug
      ? slugify(slug, {
          lower: true,
          strict: true,
        })
      : slugify(title, {
          lower: true,
          strict: true,
        });

    // Duplicate check
    const exists = await StudyNews.findOne({
      slug: generatedSlug,
    });

    if (exists) {
      return NextResponse.json(
        {
          message:
            "❌ Duplicate slug/title found",
        },
        { status: 400 }
      );
    }

    // Convert keywords
    let keywordsArray: string[] = [];

    if (typeof keywords === "string") {
      keywordsArray = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    } else if (Array.isArray(keywords)) {
      keywordsArray = keywords;
    }

    // Create news
    const news = new StudyNews({
      title,
      slug: generatedSlug,

      description,

      coverImage: coverImage || "",
      imageUrl: imageUrl || "",

      author: author || "Admin",

      seoTitle:
        seoTitle || title,

      metaDescription:
        metaDescription ||
        createSnippet(
          stripHtml(description),
          150
        ),

      keywords: keywordsArray,

      visibility:
        visibility || "draft",

      publishDate: new Date(),
    });

    await news.save();

    /* =========================================
       SEND EMAIL ONLY IF PUBLISHED
    ========================================= */
    if (visibility === "published") {
      try {
        const cleanDescription =
          stripHtml(description);

        const snippet =
          createSnippet(
            cleanDescription,
            200
          );

        const featuredImage =
          coverImage || imageUrl;

        await sendToAllUsers({
          subject:
            "📢 New Study Update Just In!",

          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">

              <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;">

                <div style="background:#0057ff;padding:20px;text-align:center;color:#fff;">
                  <h1 style="margin:0;font-size:22px;">
                    📰 Finderight News
                  </h1>
                </div>

                ${
                  featuredImage
                    ? `
                    <img
                      src="${featuredImage}"
                      alt="${title}"
                      style="width:100%;max-height:320px;object-fit:cover;"
                    />
                  `
                    : ""
                }

                <div style="padding:30px;">

                  <p style="font-size:15px;color:#6b7280;">
                    Hi {{name}},
                  </p>

                  <h2 style="font-size:24px;color:#111827;line-height:1.4;">
                    ${title}
                  </h2>

                  <p style="font-size:16px;color:#4b5563;line-height:1.8;">
                    ${snippet}
                  </p>

                  <div style="margin-top:30px;text-align:center;">
                    <a
                      href="${process.env.FRONTEND_URL}/study-news/${generatedSlug}"
                      style="
                        display:inline-block;
                        padding:14px 28px;
                        background:#0057ff;
                        color:#fff;
                        text-decoration:none;
                        border-radius:8px;
                        font-weight:bold;
                      "
                    >
                      👉 Read Full Article
                    </a>
                  </div>

                </div>

              </div>

            </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error(
          "❌ Email error:",
          emailError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "✅ Study news created successfully",

        news,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "❌ Error creating news:",
      errMsg
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "❌ Error creating study news",

        error: errMsg,
      },
      { status: 500 }
    );
  }
}

/* =========================================
   🟦 GET — SINGLE / LIST
========================================= */
export async function GET(req: Request) {
  try {
    const { searchParams } =
      new URL(req.url);

    const slug =
      searchParams.get("slug");

    const page = parseInt(
      searchParams.get("page") || "1"
    );

    const search =
      searchParams.get("search");

    const visibility =
      searchParams.get("visibility");

    /* =========================================
       SINGLE ARTICLE
    ========================================= */
    if (slug) {
      const news =
        await StudyNews.findOne({
          slug,
        });

      if (!news) {
        return NextResponse.json(
          {
            message:
              "❌ News not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        news,
        { status: 200 }
      );
    }

    /* =========================================
       FILTERS
    ========================================= */
    const query: any = {};

    // Public API only shows published
    if (visibility) {
      query.visibility = visibility;
    } else {
      query.visibility = "published";
    }

    // Search
    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          metaDescription: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /* =========================================
       PAGINATION
    ========================================= */
    const limit = 10;

    const skip =
      (page - 1) * limit;

    const newsList =
      await StudyNews.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

    const total =
      await StudyNews.countDocuments(
        query
      );

    return NextResponse.json(
      {
        success: true,

        newsList,

        currentPage: page,

        totalPages: Math.ceil(
          total / limit
        ),

        totalNews: total,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "❌ GET error:",
      errMsg
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "❌ Error fetching study news",

        error: errMsg,
      },
      { status: 500 }
    );
  }
}

/* =========================================
   🟥 DELETE
========================================= */
export async function DELETE(req: Request) {
  try {
    const { searchParams } =
      new URL(req.url);

    const slug =
      searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        {
          message:
            "❌ Slug is required",
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
          message:
            "❌ News not found",
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
    const errMsg =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "❌ Delete error:",
      errMsg
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "❌ Error deleting news",

        error: errMsg,
      },
      { status: 500 }
    );
  }
}

/* =========================================
   ❌ METHOD NOT ALLOWED
========================================= */
export function PUT() {
  return NextResponse.json(
    {
      message:
        "❌ PUT method not allowed",
    },
    { status: 405 }
  );
}