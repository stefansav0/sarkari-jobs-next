import { NextResponse } from "next/server";

// 🌐 Your website & API base
const siteUrl = "https://finderight.com";
const jobsApiUrl = `${siteUrl}/api/jobs`;

// Job data type
interface Job {
    _id: string;
    slug?: string;
    title: string;
    description?: string;
    date?: string | number;
    lastDate?: string;
    createdAt?: string;
}

export async function GET() {
    try {
        // ✅ Fetch latest jobs
        const res = await fetch(jobsApiUrl, { cache: "no-store" });

        if (!res.ok) {
            console.error("Feed fetch error:", res.status, res.statusText);
            throw new Error(`Failed to fetch jobs: ${res.statusText}`);
        }

        // 👇 The API returns { jobs: [...] }, not just an array
        const data = await res.json();
        const jobs: Job[] = Array.isArray(data.jobs) ? data.jobs : [];

        if (!jobs.length) {
            console.warn("No jobs found in API response.");
        }

        // ✅ Build RSS XML items
        const feedItems = jobs
            .map(
                (job) => `
        <item>
          <title><![CDATA[${job.title}]]></title>
          <link>${siteUrl}/jobs/${job.slug || job._id}</link>
          <description><![CDATA[${job.description ||
                    "Find all details about this Sarkari job update on Finderight."
                    }]]></description>
          <pubDate>${new Date(
                        job.createdAt || job.lastDate || Date.now()
                    ).toUTCString()}</pubDate>
        </item>`
            )
            .join("");

        // ✅ Wrap full RSS feed
        const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Finderight - Latest Sarkari Jobs Feed</title>
    <link>${siteUrl}</link>
    <description>Stay updated with the latest Sarkari jobs, results, and admit cards from Finderight.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${feedItems}
  </channel>
</rss>`;

        return new NextResponse(rssFeed, {
            headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
        });
    } catch (error) {
        console.error("Error generating RSS feed:", error);
        return new NextResponse("Failed to generate RSS feed", { status: 500 });
    }
}
