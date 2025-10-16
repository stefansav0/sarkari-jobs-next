import { connectDB } from "@/lib/db";

import AnswerKey from "@/lib/models/AnswerKey";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const { slug } = req.query;
      const answerKey = await AnswerKey.findOne({ slug });

      if (!answerKey) {
        return res.status(404).json({ message: "Answer key not found" });
      }

      res.status(200).json(answerKey);
    } catch (error) {
      res.status(500).json({ message: "Error fetching answer key", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
