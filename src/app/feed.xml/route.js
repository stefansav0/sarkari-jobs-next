import { NextResponse } from "next/server";

const siteUrl = "https://finderight.com";
export const dynamic = "force-dynamic";

/* -----------------------------------------
   🔥 Smart Array Extractor (RECURSIVE)
------------------------------------------*/
function extractArray(obj) {
  if (!obj || typeof obj !== "object") return null;

  if (Array.isArray(obj)) return obj;

  for (const key in obj) {
    const found = extractArray(obj[key]);
    if (Array.isArray(found)) return found;
  }

  return null;
}

/* -----------------------------------------
   Fetch API & auto-detect list
------------------------------------------*/
async function fetchList(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    const list = extractArray(data);

    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.error("Feed fetch error:", url, error);
    return [];
  }
}

/* -----------------------------------------
   Generate MASTER RSS Feed
------------------------------------------*/
export async function GET() {
  try {
    const base =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : siteUrl;

    // 🔥 Fetch EVERYTHING safely
    const jobs = await fetchList(`${base}/api/jobs?page=1&limit=50`);
    const results = await fetchList(`${base}/api/results?page=1&limit=50`);
    const admitCards = await fetchList(`${base}/api/admit-cards?page=1&limit=50`);
    const admissions = await fetchList(`${base}/api/admissions?page=1&limit=50`);
    const answerKeys = await fetchList(`${base}/api/answer-keys?page=1&limit=50`);
    const studyNews = await fetchList(`${base}/api/study-news?page=1&limit=50`);

    // 🔥 Normalize
    const allItems = [
      ...jobs.map((j) => ({
        title: j.title,
        slug: `/jobs/${j.slug}`,
        description: j.shortInfo || j.description,
        date: j.createdAt || j.lastDate,
      })),

      ...results.map((r) => ({
        title: r.title,
        slug: `/result/${r.slug}`,
        description: r.shortInfo,
        date: r.createdAt || r.resultDate,
      })),

      ...admitCards.map((a) => ({
        title: a.title,
        slug: `/admit-card/${a.slug}`,
        description: a.shortInfo,
        date: a.createdAt || a.examDate,
      })),

      ...admissions.map((a) => ({
        title: a.title,
        slug: `/admission/${a.slug}`,
        description: a.shortInfo,
        date: a.createdAt,
      })),

      ...answerKeys.map((k) => ({
        title: k.title,
        slug: `/answer-key/${k.slug}`,
        description: k.shortInfo,
        date: k.createdAt,
      })),

      // ✅ STUDY NEWS (FINALLY FIXED)
      ...studyNews.map((n) => ({
        title: n.title,
        slug: `/study-news/${n.slug}`,
        description: n.shortInfo || n.description,
        date: n.createdAt,
      })),
    ]
      .filter((i) => i.title && i.slug)
      .sort(
        (a, b) =>
          new Date(b.date || Date.now()) -
          new Date(a.date || Date.now())
      )
      .slice(0, 100);

    const itemsXml = allItems
      .map((i) => {
        const url = `${siteUrl}${i.slug}`;
        return `
<item>
  <title><![CDATA[${i.title}]]></title>
  <link>${url}</link>
  <guid>${url}</guid>
  <description><![CDATA[${i.description || i.title}]]></description>
  <pubDate>${new Date(i.date || Date.now()).toUTCString()}</pubDate>
</item>`;
      })
      .join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Finderight – Sarkari Jobs, Results & Education Updates</title>
  <link>${siteUrl}</link>
  <description>
    Latest Sarkari Jobs, Results, Admit Cards, Admissions,
    Answer Keys and Study News in India.
  </description>
  <language>en-IN</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${itemsXml}
</channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("❌ RSS error:", err);
    return new NextResponse("RSS generation failed", { status: 500 });
  }
}
