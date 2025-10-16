// pages/api/jobs/id/[id].js

import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import slugify from "slugify";

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const job = await Job.findById(id);
      if (!job) return res.status(404).json({ message: "Job not found" });

      return res.status(200).json({ success: true, job });
    } catch (error) {
      console.error("❌ Error fetching job:", error);
      return res.status(500).json({ message: "Server Error", error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const updatedData = { ...req.body };

      if (updatedData.title) {
        updatedData.slug = slugify(updatedData.title, { lower: true, strict: true });
      }

      const job = await Job.findByIdAndUpdate(id, updatedData, { new: true });
      if (!job) return res.status(404).json({ message: "Job not found" });

      return res.status(200).json({ message: "✅ Job updated successfully", job });
    } catch (error) {
      console.error("❌ Error updating job:", error);
      return res.status(500).json({ message: "Server Error", error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const job = await Job.findByIdAndDelete(id);
      if (!job) return res.status(404).json({ message: "Job not found" });

      return res.status(200).json({ message: "🗑️ Job deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting job:", error);
      return res.status(500).json({ message: "Server Error", error: error.message });
    }
  }

  // Catch unsupported methods
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
