import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AdmitCard from "@/models/AdmitCard";

export async function GET() {
  await connectDB();

  const cards = await AdmitCard.find().select("slug updatedAt");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cards
  .map(
    (card) => `
<url>
<loc>https://finderight.com/admit-card/${card.slug}</loc>
<lastmod>${card.updatedAt.toISOString()}</lastmod>
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