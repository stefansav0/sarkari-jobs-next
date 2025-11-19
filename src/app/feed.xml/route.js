import { NextResponse } from "next/server";

const siteUrl = "https://finderight.com";

export async function GET() {
    try {
        const baseApiUrl =
            process.env.NODE_ENV === "development"
                ? "http://localhost:3000/api/jobs"
                : `${siteUrl}/api/jobs`;

        const res = await fetch(baseApiUrl, { cache: "no-store" });

        if (!res.ok) {
            throw new Error(`Failed to fetch jobs: ${res.statusText}`);
        }

        const data = await res.json();
        const jobs = Array.isArray(data.jobs) ? data.jobs : [];

        // 🔥 Only include jobs that have a slug
        const feedItems = jobs
            .filter((job) => job.slug)
            .map((job) => {
                const jobUrl = `${siteUrl}/jobs/${job.slug}`;
                const date = new Date(job.createdAt || job.lastDate || Date.now());

                return `
  <item>
    <title><![CDATA[${job.title}]]></title>
    <link>${jobUrl}</link>
    <guid>${jobUrl}</guid>
    <description><![CDATA[${job.description ||
                    "Find all details about this Sarkari job update on Finderight."
                    }]]></description>
    <pubDate>${date.toUTCString()}</pubDate>
  </item>`;
            })
            .join("");

        const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Finderight - Latest Sarkari Jobs Feed</title>
  <link>${siteUrl}</link>
  <description>Your trusted source for Sarkari jobs, results, admit cards & updates.</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${feedItems}
</channel>
</rss>`;

        return new NextResponse(rssFeed, {
            headers: {
                "Content-Type": "application/rss+xml; charset=utf-8",
            },
        });
    } catch (error) {
        console.error("RSS Feed Error:", error);
        return new NextResponse("Failed to generate RSS feed", { status: 500 });
    }
}
