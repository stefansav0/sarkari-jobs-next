import { connectDB } from "@/lib/db";
import Document from '@/lib/models/Document';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    // Get paginated documents
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
      const documents = await Document.find()
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Document.countDocuments();

      return res.status(200).json({
        documents,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      return res.status(500).json({ message: '❌ Error fetching documents', error: error.message });
    }
  } 
  else if (req.method === 'POST') {
    // Create new document
    const { title, ...rest } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    try {
      const document = new Document({
        title,
        slug: slugify(title, { lower: true, strict: true }),
        ...rest,
      });

      await document.save();

      return res.status(201).json({ message: '✅ Document created successfully', document });
    } catch (error) {
      console.error('❌ Error saving document:', error);
      if (error.code === 11000 && error.keyPattern?.slug) {
        return res.status(409).json({ message: 'Slug already exists. Try a different title.' });
      }
      return res.status(500).json({ message: '❌ Error saving document', error: error.message });
    }
  } 
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
