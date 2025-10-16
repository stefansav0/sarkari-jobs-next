// /pages/api/jobs/latest.js
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";


export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const jobs = await Job.find().sort({ createdAt: -1 }).limit(6);
      return res.status(200).json({ success: true, jobs });
    } catch (error) {
      console.error("❌ Error fetching latest jobs:", error);
      return res.status(500).json({ error: "Server Error", message: error.message });
    }
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
