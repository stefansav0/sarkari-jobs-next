// /pages/api/jobs/index.js
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";

import { sendToAllUsers } from "@/lib/sendEmail";
import slugify from "slugify";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const jobs = await Job.find().sort({ createdAt: -1 });
      return res.status(200).json({ jobs, total: jobs.length });
    } catch (error) {
      return res.status(500).json({ error: "Server Error", message: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { title } = req.body;
      if (!title) return res.status(400).json({ message: "Title is required" });

      const slug = slugify(title, { lower: true, strict: true });
      const jobData = { ...req.body, slug };

      const job = new Job(jobData);
      await job.save();

      await sendToAllUsers({
        subject: `New Job Posted!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>📰 Finderight Jobs Notification</h2>
            <p>Hi {{name}},</p>
            <p>A new job has just been posted on <strong>Finderight</strong>:</p>
            <ul>
              <li><strong>📌 Title:</strong> ${job.title}</li>
              <li><strong>🏢 Department:</strong> ${job.department}</li>
              <li><strong>⏰ Last Date:</strong> ${new Date(job.lastDate).toISOString().split("T")[0]}</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/jobs/${job.department.toLowerCase()}/${job.slug}">
              👉 View Full Job Details
            </a>
            <p>Best,<br />Finderight Team</p>
          </div>
        `
      });

      return res.status(201).json({ success: true, message: "✅ Job created successfully", job });
    } catch (error) {
      console.error("❌ Job creation error:", error);
      return res.status(422).json({ success: false, message: "Failed to create job", error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
