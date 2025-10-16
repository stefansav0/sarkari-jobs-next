import { connectDB } from "@/lib/db";
import Document from '@/lib/models/Document';

export default async function handler(req, res) {
  await connectDB();

  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const document = await Document.findOne({ slug });
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      return res.status(200).json(document);
    } catch (error) {
      return res.status(500).json({ message: '❌ Error fetching document', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
