import { connectDB } from "@/lib/db";
import Result from '../../../lib/models/Result';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const { slug } = req.query;

    try {
      const result = await Result.findOne({ slug });

      if (!result) {
        return res.status(404).json({ message: 'Result not found' });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error fetching result:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
