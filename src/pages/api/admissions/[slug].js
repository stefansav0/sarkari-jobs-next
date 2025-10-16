import { connectDB } from '@/lib/db';
import Admission from '@/lib/models/Admission';

connectDB();

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const admission = await Admission.findOne({ slug });

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    return res.status(200).json(admission);
  } catch (error) {
    return res.status(500).json({ message: "❌ Error fetching admission", error: error.message });
  }
}
