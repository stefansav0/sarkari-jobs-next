import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import StudyNews from "@/models/StudyNews";

export async function GET() {
  await connectDB();

  const posts = await StudyNews.find().select("slug updatedAt");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${posts
  .map(
    (post) => `
<url>
<loc>https://finderight.com/study-news/${post.slug}</loc>
<lastmod>${post.updatedAt.toISOString()}</lastmod>
<changefreq>daily</changefreq>
<priority>0.8</priority>
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