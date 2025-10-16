import { connectDB } from "@/lib/db";
import AnswerKey from "@/lib/models/AnswerKey";
import slugify from "slugify";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    try {
      const data = {
        ...req.body,
        slug: slugify(req.body.title, { lower: true, strict: true }),
        departmentSlug: slugify(req.body.department || "", { lower: true, strict: true }),
      };

      const answerKey = new AnswerKey(data);
      await answerKey.save();

      res.status(201).json({ message: "✅ Answer Key created successfully", answerKey });
    } catch (error) {
      res.status(500).json({ message: "❌ Error saving answer key", error: error.message });
    }
  } else if (req.method === "GET") {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const answerKeys = await AnswerKey.find()
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await AnswerKey.countDocuments();

      res.status(200).json({
        answerKeys,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching answer keys", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
