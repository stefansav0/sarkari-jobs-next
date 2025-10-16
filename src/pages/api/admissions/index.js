import { connectDB } from '@/lib/db';       // your DB connect helper (must have a default export)
import Admission from '@/lib/models/Admission';
import slugify from 'slugify';

connectDB(); // connect to DB once at the top (or inside handler)

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    // Create Admission (your previous createAdmission logic here)
    try {
      const { title, ...rest } = req.body;
      if (!title) return res.status(400).json({ message: "Title is required" });

      const slug = slugify(title, { lower: true, strict: true });

      if (rest.lastDate && isNaN(Date.parse(rest.lastDate))) {
        return res.status(400).json({ message: "Invalid lastDate format" });
      }

      const admission = new Admission({ title, slug, ...rest });
      await admission.save();

      return res.status(201).json({ message: "✅ Admission created successfully", admission });
    } catch (error) {
      console.error(error);
      if (error.code === 11000 && error.keyPattern?.slug) {
        return res.status(409).json({ message: "Slug already exists. Try a different title." });
      }
      return res.status(500).json({ message: "❌ Error saving admission", error: error.message });
    }
  } else if (method === 'GET') {
    // Get paginated admissions (your previous getPaginatedAdmissions logic here)
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const admissions = await Admission.find()
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Admission.countDocuments();

      return res.json({
        admissions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      return res.status(500).json({ message: "❌ Error fetching admissions", error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
