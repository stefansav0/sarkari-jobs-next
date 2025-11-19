import { connectDB } from '@/lib/db';
import Admission from '@/lib/models/Admission';
import slugify from 'slugify';

// Connect to MongoDB
connectDB();

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  try {
    // ===================================
    // 🟩 POST — Create Admission
    // ===================================
    if (method === 'POST') {
      console.log("📩 Incoming POST body:", req.body);

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
      } = req.body || {};

      // 🧩 Basic validation
      if (!title.trim()) {
        return res.status(400).json({ message: "❌ 'title' field is required." });
      }
      if (!conductedBy.trim()) {
        return res.status(400).json({ message: "❌ 'conductedBy' field is required." });
      }

      // 🧩 Slug creation
      const slug = slugify(title, { lower: true, strict: true });

      // 🧩 Create admission document
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
        importantLinks: {
          applyOnline: importantLinks.applyOnline || "",
          downloadNotice: importantLinks.downloadNotice || "",
          officialWebsite: importantLinks.officialWebsite || "",
        },
      });

      await admission.save();

      return res.status(201).json({
        message: "✅ Admission created successfully!",
        admission,
      });
    }

    // ===================================
    // 🟦 GET — List Admissions
    // ===================================
    if (method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const admissions = await Admission.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Admission.countDocuments();

      return res.status(200).json({
        message: "✅ Admissions fetched successfully",
        admissions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    }

    // ===================================
    // ❌ Method Not Allowed
    // ===================================
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${method} Not Allowed` });

  } catch (error) {
    console.error("🔥 API Error:", error);

    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(409).json({
        message: "❌ Slug already exists. Try a different title.",
      });
    }

    return res.status(500).json({
      message: "❌ Server error while processing admission.",
      error: error.message,
    });
  }
}
