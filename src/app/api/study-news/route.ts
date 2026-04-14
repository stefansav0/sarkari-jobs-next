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
      await sendToAllUsers({
        subject: "📢 New Study Update Just In!",
        html: `
            <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 16px;">
                <div style="background-color: #0057ff; padding: 16px; color: white; border-radius: 8px;">
                    <strong>📰 Finderight News Alert</strong>
                </div>
                <p>Hi {{name}}, a new article has been posted:</p>
                <h3>${title}</h3>
                <p>${description.slice(0, 200)}...</p>
                <a 
                    href="${process.env.FRONTEND_URL}/study-news/${slug}"
                    style="display:block; padding:12px; background:#0057ff; color:#fff; 
                        text-align:center; border-radius:6px; margin-top:10px;">
                    👉 Read Full Article
                </a>
            </div>
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