import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET() {
  await connectDB();

  const jobs = await Job.find().select("slug updatedAt");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${jobs
  .map(
    (job) => `
<url>
<loc>https://finderight.com/jobs/${job.slug}</loc>
<lastmod>${job.updatedAt.toISOString()}</lastmod>
<changefreq>daily</changefreq>
<priority>0.9</priority>
</url>`
  )
  .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}