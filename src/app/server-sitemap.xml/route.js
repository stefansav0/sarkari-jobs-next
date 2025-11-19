import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

import Job from "@/lib/models/Job";
import AdmitCard from "@/lib/models/AdmitCard";
import Result from "@/lib/models/Result";
import AnswerKey from "@/lib/models/AnswerKey";
import Admission from "@/lib/models/Admission";

const siteUrl = "https://finderight.com";

// 🔥 Safe date function to avoid "Invalid time value" error
function safeDate(value) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
}

export async function GET() {
    try {
        await connectDB();

        const [jobs, admitCards, results, answerKeys, admissions] = await Promise.all([
            Job.find().sort({ updatedAt: -1 }),
            AdmitCard.find().sort({ updatedAt: -1 }),
            Result.find().sort({ updatedAt: -1 }),
            AnswerKey.find().sort({ updatedAt: -1 }),
            Admission.find().sort({ updatedAt: -1 }),
        ]);

        let urls = [];

        // Jobs
        jobs.forEach((item) => {
            if (!item.slug) return;
            urls.push(`
        <url>
          <loc>${siteUrl}/jobs/${item.slug}</loc>
          <lastmod>${safeDate(item.updatedAt || item.createdAt).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.9</priority>
        </url>
      `);
        });

        // Admit Cards
        admitCards.forEach((item) => {
            if (!item.slug) return;
            urls.push(`
        <url>
          <loc>${siteUrl}/admit-card/${item.slug}</loc>
          <lastmod>${safeDate(item.updatedAt || item.createdAt).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.9</priority>
        </url>
      `);
        });

        // Results
        results.forEach((item) => {
            if (!item.slug) return;
            urls.push(`
        <url>
          <loc>${siteUrl}/results/${item.slug}</loc>
          <lastmod>${safeDate(item.updatedAt || item.createdAt).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.9</priority>
        </url>
      `);
        });

        // Answer Keys
        answerKeys.forEach((item) => {
            if (!item.slug) return;
            urls.push(`
        <url>
          <loc>${siteUrl}/answer-key/${item.slug}</loc>
          <lastmod>${safeDate(item.updatedAt || item.createdAt).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.9</priority>
        </url>
      `);
        });

        // Admissions
        admissions.forEach((item) => {
            if (!item.slug) return;
            urls.push(`
        <url>
          <loc>${siteUrl}/admission/${item.slug}</loc>
          <lastmod>${safeDate(item.updatedAt || item.createdAt).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.9</priority>
        </url>
      `);
        });

        // Final XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: { "Content-Type": "application/xml" },
        });

    } catch (error) {
        console.error("❌ Server Sitemap Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
