import { connectDB } from '@/lib/db'; // ✅ CORRECT
import AdmitCard from '@/lib/models/AdmitCard';
import slugify from 'slugify';

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;

  if (method === 'POST') {
    try {
      const data = {
        ...req.body,
        slug: slugify(req.body.title, { lower: true, strict: true }),
      };

      const admitCard = new AdmitCard(data);
      await admitCard.save();

      return res.status(201).json({ message: "✅ Admit Card created successfully", admitCard });
    } catch (error) {
      return res.status(500).json({ message: "❌ Error saving admit card", error: error.message });
    }
  }

  if (method === 'GET') {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
      const admitCards = await AdmitCard.find()
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await AdmitCard.countDocuments();

      return res.status(200).json({
        admitCards,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (error) {
      return res.status(500).json({ message: "Error fetching admit cards", error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
