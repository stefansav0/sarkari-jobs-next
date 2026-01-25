import React from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Container,
  Divider,
  Chip,
  Paper,
} from "@mui/material";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

/* -------------------------------
   Types
-------------------------------- */
interface News {
  title: string;
  createdAt: string;
  description: string;
  coverImage?: string;
  author?: string;
  slug: string;
}

/* -------------------------------
   Helpers
-------------------------------- */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

/* ✅ Safe recursive extractor (NO any) */
function extractArray(input: unknown): News[] {
  if (Array.isArray(input)) return input as News[];

  if (input && typeof input === "object") {
    const record = input as Record<string, unknown>;
    for (const key in record) {
      const found = extractArray(record[key]);
      if (found.length) return found;
    }
  }
  return [];
}

/* -------------------------------
   Fetch Single Article
-------------------------------- */
async function getNews(slug: string): Promise<News | null> {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.finderight.com";

  const res = await fetch(`${base}/api/study-news?slug=${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

/* -------------------------------
   Fetch Related Articles
-------------------------------- */
async function getRelated(slug: string): Promise<News[]> {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.finderight.com";

  const res = await fetch(`${base}/api/study-news?page=1&limit=10`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data: unknown = await res.json();
  const list = extractArray(data);

  return list.filter((n) => n.slug !== slug).slice(0, 5);
}

/* -------------------------------
   SEO Metadata (FIXED)
-------------------------------- */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params; // ✅ FIX
  const news = await getNews(slug);

  if (!news) {
    return {
      title: "Study News Not Found | Finderight",
      robots: { index: false, follow: false },
    };
  }

  const description = stripHtml(news.description).slice(0, 160);
  const canonicalUrl = `https://finderight.com/study-news/${slug}`;
  const cover = news.coverImage || "https://finderight.com/default-cover.jpg";

  return {
    title: `${news.title} | Finderight`,
    description,
    alternates: { canonical: canonicalUrl },

    openGraph: {
      title: news.title,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "Finderight",
      publishedTime: news.createdAt,
      images: [{ url: cover, width: 1200, height: 630 }],
    },

    twitter: {
      card: "summary_large_image",
      title: news.title,
      description,
      images: [cover],
    },

    robots: { index: true, follow: true },
  };
}

/* -------------------------------
   Page Component (FIXED)
-------------------------------- */
export default async function StudyNewsDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ FIX
  const news = await getNews(slug);

  if (!news) return notFound();

  const related = await getRelated(slug);
  const coverImage = news.coverImage || "/default-cover.jpg";

  /* -------- Structured Data -------- */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    datePublished: news.createdAt,
    dateModified: news.createdAt,
    description: stripHtml(news.description).slice(0, 160),
    image: [coverImage],
    author: {
      "@type": "Organization",
      name: "Finderight",
    },
    publisher: {
      "@type": "Organization",
      name: "Finderight",
      logo: {
        "@type": "ImageObject",
        url: "https://finderight.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://finderight.com/study-news/${slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "3fr 1fr" }}
          gap={4}
        >
          {/* MAIN ARTICLE */}
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
            <Chip label="Study News" color="primary" size="small" sx={{ mb: 2 }} />

            <Typography variant="h3" component="h1" fontWeight={700} mb={2}>
              {news.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
              Published on{" "}
              {new Date(news.createdAt).toLocaleDateString("en-IN")} • By{" "}
              {news.author || "Finderight News Desk"}
            </Typography>

            <Box
              component="img"
              src={coverImage}
              alt={news.title}
              sx={{
                width: "100%",
                borderRadius: 3,
                mb: 4,
                maxHeight: 480,
                objectFit: "cover",
              }}
            />

            <Divider sx={{ mb: 4 }} />

            <Box
              sx={{
                fontSize: "1.08rem",
                lineHeight: 1.9,
                fontFamily: 'Georgia, "Times New Roman", serif',
                "& p": { mb: 2 },
              }}
              dangerouslySetInnerHTML={{ __html: news.description }}
            />
          </Paper>

          {/* RELATED */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Related Articles
            </Typography>

            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/study-news/${item.slug}`}
                style={{ textDecoration: "none" }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 3,
                    "&:hover": { boxShadow: 4 },
                  }}
                >
                  <Typography fontSize="0.95rem" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography fontSize="0.75rem" color="text.secondary">
                    {new Date(item.createdAt).toLocaleDateString("en-IN")}
                  </Typography>
                </Paper>
              </Link>
            ))}
          </Box>
        </Box>

        <Box textAlign="center" mt={5}>
          <Link href="/study-news" style={{ color: "#1976d2" }}>
            ← Back to Study News
          </Link>
        </Box>
      </Container>
    </>
  );
}
