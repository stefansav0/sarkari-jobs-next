import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StudyNews from "@/lib/models/StudyNews";
import slugify from "slugify";
import { sendToAllUsers } from "@/lib/sendEmail";

// Connect to DB globally
connectDB();

/* -----------------------------------------
   Types
------------------------------------------*/
interface StudyNewsRequestBody {
  title: string;
  description: string;
  coverImage?: string;
  author?: string;
}

/* -----------------------------------------
   Helpers
------------------------------------------*/
// Aggressively removes HTML tags, inline styles, classes, and decode common entities
function stripHtml(html: string): string {
  if (!html) return "";
  
  let text = html;
  
  // 1. Remove style tags and their content
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // 2. Remove script tags and their content
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  // 3. Remove all HTML tags (even those with complex attributes like Tailwind classes)
  text = text.replace(/<[^>]*>?/gm, '');
  // 4. Replace common HTML entities with spaces or actual characters
  text = text.replace(/&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, ' ');
  text = text.replace(/&amp;/gi, '&');
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&lt;/gi, '<');
  
  // 5. Replace multiple spaces/newlines with a single space and trim
  return text.replace(/\s+/g, " ").trim();
}

// Safely truncate to nearest word to avoid cutting words in half
function createSnippet(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  
  // Cut at maxLength
  const truncated = text.substring(0, maxLength);
  
  // Find the last space to avoid cutting a word in half
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  
  if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + "...";
  }
  
  return truncated + "...";
}

/* -----------------------------------------
   🟩 POST — Create Study News + Send Email
------------------------------------------*/
export async function POST(req: Request) {
  try {
    const body: StudyNewsRequestBody = await req.json();
    const { title, description, coverImage, author } = body;

    if (!title) {
      return NextResponse.json(
        { message: "❌ Title is required" },
        { status: 400 }
      );
    }

    const slug = slugify(title, { lower: true, strict: true });

    // Duplicate slug check
    const exists = await StudyNews.findOne({ slug });
    if (exists) {
      return NextResponse.json(
        { message: "❌ Duplicate post. Modify the title." },
        { status: 400 }
      );
    }

    const news = new StudyNews({
      title,
      description,
      slug,
      coverImage: coverImage || "",
      author: author || "Admin",
      publishDate: new Date(),
    });

    await news.save();

    /* --- Send Email Notification --- */
    try {
      // 1. Aggressively clean the HTML out of the description
      const cleanDescription = stripHtml(description);
      
      // 2. Safely create a snippet that doesn't break words
      const snippet = createSnippet(cleanDescription, 200);

      await sendToAllUsers({
        subject: "📢 New Study Update Just In!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background-color: #0057ff; padding: 20px; color: #ffffff; text-align: center;">
                    <strong style="font-size: 20px; letter-spacing: 0.5px;">📰 Finderight News Alert</strong>
                </div>
                
                <div style="padding: 30px;">
                    <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Hi {{name}}, a new article has been posted:</p>
                    
                    <h2 style="color: #111827; font-size: 22px; margin-top: 0; margin-bottom: 15px; line-height: 1.3;">
                        ${title}
                    </h2>
                    
                    <div style="background-color: #f8fafc; border-left: 4px solid #0057ff; padding: 15px; margin-bottom: 25px;">
                        <p style="color: #4b5563; line-height: 1.6; margin: 0; font-size: 15px;">
                            ${snippet}
                        </p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/study-news/${slug}"
                           style="display: inline-block; padding: 14px 28px; background-color: #0057ff; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px;">
                           👉 Read Full Article
                        </a>
                    </div>
                </div>
                
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        You received this because you subscribed to Finderight alerts.
                    </p>
                </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailErr: unknown) {
      if (emailErr instanceof Error) {
        console.error("❌ Email sending failed:", emailErr.message);
      } else {
        console.error("❌ Email sending failed:", emailErr);
      }
    }

    return NextResponse.json(
      { message: "✅ Study News created successfully", news },
      { status: 201 }
    );

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error saving study news:", errMsg);

    return NextResponse.json(
      { message: "❌ Error saving news", error: errMsg },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟦 GET — Single News (slug) OR Paginated List
------------------------------------------*/
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");

    /* ----- Fetch Single Article ----- */
    if (slug) {
      const news = await StudyNews.findOne({ slug });

      if (!news) {
        return NextResponse.json(
          { message: "❌ Study News not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(news, { status: 200 });
    }

    /* ----- Paginated List ----- */
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    const newsList = await StudyNews.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StudyNews.countDocuments();

    return NextResponse.json(
      {
        newsList,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";

    console.error("❌ Error fetching study news:", errMsg);

    return NextResponse.json(
      { message: "❌ Server error", error: errMsg },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   🟥 DELETE — Delete Study News by Slug
------------------------------------------*/
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { message: "❌ Slug is required in the query parameters" },
        { status: 400 }
      );
    }

    const deletedNews = await StudyNews.findOneAndDelete({ slug });

    if (!deletedNews) {
      return NextResponse.json(
        { message: "❌ Study news not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "✅ Study news deleted successfully", deletedNews },
      { status: 200 }
    );

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error deleting study news:", errMsg);

    return NextResponse.json(
      { message: "❌ Server error", error: errMsg },
      { status: 500 }
    );
  }
}

/* -----------------------------------------
   ❌ Methods Not Allowed
------------------------------------------*/
export function PUT() {
  return NextResponse.json(
    { message: "Method PUT Not Allowed" },
    { status: 405 }
  );
}