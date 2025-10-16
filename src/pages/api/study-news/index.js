import { connectDB } from "@/lib/db";          // your mongoose connect helper
import StudyNews from '@/lib/models/StudyNews';
import slugify from 'slugify';
import { sendToAllUsers } from "@/lib/sendEmail";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    // Create Study News and notify users
    try {
      const { title, description, coverImage, author } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const slug = slugify(title, { lower: true, strict: true });

      const existing = await StudyNews.findOne({ slug });
      if (existing) {
        return res.status(400).json({
          message: "A post with a similar title already exists. Please modify the title.",
        });
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

      // Notify all users via email
      await sendToAllUsers({
        subject: `📢 New Study Update Just In!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 16px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">
            <div style="background-color: #0057ff; padding: 16px; border-radius: 8px; color: white; text-align: center; margin-top: 10px;">
              <strong style="font-size: 18px;">📰 Finderight News Alert</strong>
            </div>
            <p style="font-size: 16px; color: #333; margin-top: 20px;">
              Hi {{name}},
            </p>
            <p style="font-size: 15px; color: #444;">
              A new article has just been published on <strong>Finderight</strong> that you might find helpful:
            </p>
            <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin-top: 10px;">
              <h3 style="margin: 0 0 8px; font-size: 18px; color: #222;">${title}</h3>
              <p style="font-size: 14px; color: #555; line-height: 1.5;">
                ${description.slice(0, 200)}...
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}/study-news/${slug}" style="display: inline-block; padding: 12px 24px; background-color: #0057ff; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">
                👉 Read Full Article
              </a>
            </div>
            <p style="font-size: 13px; color: #888; text-align: center; margin-top: 30px;">
              Best regards,<br />
              <strong>Finderight Team</strong>
            </p>
          </div>
        `,
      });

      return res.status(201).json({ message: "✅ Study News created successfully", news });
    } catch (error) {
      console.error("❌ Error saving study news:", error);
      return res.status(500).json({ message: "Error saving news", error: error.message });
    }
  }

  else if (req.method === 'GET') {
    // Support query param ?slug=... or paginated list with ?page=...
    try {
      if (req.query.slug) {
        const news = await StudyNews.findOne({ slug: req.query.slug });
        if (!news) {
          return res.status(404).json({ message: "Study News not found" });
        }
        return res.status(200).json(news);
      } else {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const newsList = await StudyNews.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const total = await StudyNews.countDocuments();

        return res.status(200).json({
          newsList,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching study news:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
