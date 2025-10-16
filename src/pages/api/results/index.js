import { connectDB } from "@/lib/db";  // your mongoose connection helper
import Result from '../../../lib/models/Result';

import slugify from 'slugify';
// import { sendToAllUsers } from '../../../utils/sendEmail'; // Uncomment if needed

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const {
        title,
        shortInfo,
        link,
        date,
        postDate,
        examDate,
        resultDate,
        conductedBy,
        importantLinks,
        howToCheck,
      } = req.body;

      const slug = slugify(title, { lower: true, strict: true });

      const result = new Result({
        title,
        shortInfo,
        link,
        date,
        postDate,
        examDate,
        resultDate,
        conductedBy,
        importantLinks,
        howToCheck,
        slug,
        publishDate: new Date(),
      });

      await result.save();

      // await sendToAllUsers({ subject: `New Result: ${title}`, message: `Check it out: ${link}` });

      return res.status(201).json({ message: '✅ Result created successfully', result });
    } catch (error) {
      console.error('❌ Error saving result:', error);
      return res.status(500).json({ message: 'Error saving result', error: error.message });
    }
  } else if (req.method === 'GET') {
    // Handle paginated GET (see below)
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const results = await Result.find()
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Result.countDocuments();

      return res.status(200).json({
        results,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error('❌ Error fetching results:', error);
      return res.status(500).json({ message: 'Error fetching results', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
