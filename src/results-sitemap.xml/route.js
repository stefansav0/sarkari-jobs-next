import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Result from "@/models/Result";

export async function GET() {
  await connectDB();

  const results = await Result.find().select("slug updatedAt");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${results
  .map(
    (result) => `
<url>
<loc>https://finderight.com/result/${result.slug}</loc>
<lastmod>${result.updatedAt.toISOString()}</lastmod>
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