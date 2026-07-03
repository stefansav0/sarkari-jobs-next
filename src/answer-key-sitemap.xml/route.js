import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AnswerKey from "@/models/AnswerKey";

export async function GET() {
  await connectDB();

  const keys = await AnswerKey.find().select("slug updatedAt");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${keys
  .map(
    (key) => `
<url>
<loc>https://finderight.com/answer-key/${key.slug}</loc>
<lastmod>${key.updatedAt.toISOString()}</lastmod>
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