import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admission from "@/models/Admission";

export async function GET() {
  await connectDB();

  const admissions = await Admission.find().select("slug updatedAt");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${admissions
  .map(
    (admission) => `
<url>
<loc>https://finderight.com/admission/${admission.slug}</loc>
<lastmod>${admission.updatedAt.toISOString()}</lastmod>
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