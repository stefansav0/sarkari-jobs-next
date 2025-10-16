// pages/api/jobs/slug/[slug].js
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";

export default async function handler(req, res) {
  await connectDB();

  const { slug } = req.query;

  if (req.method === "GET") {
    try {
      const job = await Job.findOne({ slug });

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      return res.status(200).json({ job });
    } catch (error) {
      return res.status(500).json({ message: "Server Error", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
