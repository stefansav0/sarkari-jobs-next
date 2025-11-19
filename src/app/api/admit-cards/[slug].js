import { connectDB } from "@/lib/db";
import AdmitCard from '@/lib/models/AdmitCard';

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;
  const { slug } = req.query;

  if (method === 'GET') {
    try {
      const admitCard = await AdmitCard.findOne({ slug });

      if (!admitCard) {
        return res.status(404).json({ message: "Admit card not found" });
      }

      return res.status(200).json(admitCard);
    } catch (err) {
      return res.status(500).json({ message: "Error fetching admit card", error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
