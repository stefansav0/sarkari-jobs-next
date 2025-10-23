import { NextResponse } from "next/server";

// ✅ Replace with your live site URL
const siteUrl = "https://finderight.com";

// ✅ Replace with your real data source (API endpoint)
const jobsApiUrl = `${siteUrl}/api/jobs`;

// ✅ Define a type-safe Job interface
interface Job {
    id?: string;
    slug?: string;
    title: string;
    description?: string;
    date?: string | number;
}

// ✅ Generate the RSS feed (Next.js 13+ Route Handler)
export async function GET() {
    try {
        // Fetch latest jobs (no caching)
        const res = await fetch(jobsApiUrl, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch job data");

        const jobs: Job[] = await res.json();

        // Build RSS <item> entries
        const feedItems = jobs
            .map(
                (job) => `
        <item>
          <title><![CDATA[${job.title}]]></title>
          <link>${siteUrl}/jobs/${job.slug || job.id || ""}</link>
          <description><![CDATA[${job.description ||
                    "Find all details about this Sarkari job update."
                    }]]></description>
          <pubDate>${new Date(job.date || Date.now()).toUTCString()}</pubDate>
        </item>`
            )
            .join("");

        // Full RSS feed XML
        const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Finderight - Latest Sarkari Jobs Feed</title>
          <link>${siteUrl}</link>
          <description>Stay updated with the latest Sarkari jobs, results, and admit cards.</description>
          <language>en</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          ${feedItems}
        </channel>
      </rss>`;

        // ✅ Return RSS response
        return new NextResponse(rssFeed, {
            headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
        });
    } catch (error) {
        console.error("Error generating RSS feed:", error);
        return new NextResponse("Failed to generate RSS feed", { status: 500 });
    }
}
