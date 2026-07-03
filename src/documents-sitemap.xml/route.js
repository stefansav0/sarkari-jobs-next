import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";

export async function GET() {
  await connectDB();

  const documents = await Document.find().select("slug updatedAt");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${documents
  .map(
    (doc) => `
<url>
<loc>https://finderight.com/documents/${doc.slug}</loc>
<lastmod>${doc.updatedAt.toISOString()}</lastmod>
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