import React from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Container,
  Divider,
  Chip,
  Paper,
  Button,
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
function unescapeHTML(str: string): string {
  if (!str) return "";
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'");
}

function stripHtml(html: string): string {
  if (!html) return "";
  const unescaped = unescapeHTML(html);
  return unescaped.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
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
   SEO Metadata
-------------------------------- */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
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
   Page Component
-------------------------------- */
export default async function StudyNewsDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNews(slug);

  if (!news) return notFound();

  const related = await getRelated(slug);
  const coverImage = news.coverImage || "/default-cover.jpg";

  const cleanHtmlContent = unescapeHTML(news.description);

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
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", pb: { xs: 6, md: 10 } }}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Background Block */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
          color: "primary.contrastText",
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
          px: 2,
          textAlign: "center",
          boxShadow: "inset 0 -10px 20px -10px rgba(0,0,0,0.2)",
        }}
      >
        <Container maxWidth="md">
          <Chip
            label="Study News"
            sx={{
              mb: { xs: 2, md: 3 },
              bgcolor: "rgba(255, 255, 255, 0.15)",
              color: "inherit",
              fontWeight: 600,
              fontSize: { xs: "0.75rem", md: "0.875rem" },
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            fontWeight={800}
            lineHeight={1.25}
            mb={3}
            sx={{
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            {news.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: 0.9,
              fontWeight: 500,
              fontSize: { xs: "0.875rem", md: "1rem" },
            }}
          >
            Published{" "}
            {new Date(news.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            • By {news.author || "Finderight News Desk"}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: { xs: -6, md: -10 }, px: { xs: 1.5, sm: 3 } }}>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", lg: "7fr 3fr" }}
          gap={{ xs: 4, lg: 5 }}
          alignItems="start"
        >
          {/* MAIN ARTICLE */}
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2.5, sm: 4, md: 6 },
              borderRadius: { xs: 3, md: 4 },
              bgcolor: "background.paper",
              overflow: "hidden", // keeps images inside border radius cleanly
            }}
          >
            <Box
              component="img"
              src={coverImage}
              alt={news.title}
              sx={{
                width: "100%",
                borderRadius: 3,
                mb: { xs: 3, md: 5 },
                maxHeight: { xs: 300, sm: 400, md: 500 },
                objectFit: "cover",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            />

            {/* Reading Content Area */}
            <Box
              sx={{
                maxWidth: "80ch",
                mx: "auto",
                color: "text.primary",
                fontSize: { xs: "1.05rem", md: "1.125rem" },
                lineHeight: { xs: 1.7, md: 1.8 },
                fontFamily: '"Merriweather", Georgia, serif',
                "& p": { mb: 3 },
                "& h2": {
                  fontSize: { xs: "1.35rem", md: "1.75rem" },
                  fontWeight: 800,
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 2,
                  mt: 5,
                  lineHeight: 1.3,
                },
                "& h3": {
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
                  fontWeight: 700,
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 2,
                  mt: 4,
                },
                "& ul, & ol": { pl: { xs: 2.5, md: 3 }, mb: 3 },
                "& li": { mb: 1.5 },
                "& a": {
                  color: "primary.main",
                  textDecoration: "none",
                  fontWeight: 500,
                },
                "& a:hover": { textDecoration: "underline" },
                "& blockquote": {
                  borderLeft: "4px solid",
                  borderColor: "primary.main",
                  pl: { xs: 2, md: 3 },
                  py: 1.5,
                  my: 4,
                  bgcolor: "grey.50",
                  fontStyle: "italic",
                  borderRadius: "0 12px 12px 0",
                  color: "text.secondary",
                },
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 3,
                  my: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
              }}
              dangerouslySetInnerHTML={{ __html: cleanHtmlContent }}
            />
          </Paper>

          {/* RELATED ARTICLES SIDEBAR (Visible on mobile at the bottom) */}
          <Box
            sx={{
              position: { lg: "sticky" },
              top: { lg: 32 },
              mt: { xs: 2, lg: 0 },
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
              mb={3}
              color="text.primary"
              sx={{ pl: { xs: 1, lg: 0 }, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
            >
              Related Reads
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/study-news/${item.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: "0 8px 24px rgba(25, 118, 210, 0.12)",
                        transform: "translateY(-3px)",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="text.primary"
                      lineHeight={1.4}
                      mb={1}
                      sx={{ fontSize: { xs: "1rem", lg: "0.95rem" } }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Typography>
                  </Paper>
                </Link>
              ))}
            </Box>

            {related.length === 0 && (
              <Typography variant="body2" color="text.secondary" pl={1}>
                No related articles found.
              </Typography>
            )}
          </Box>
        </Box>

        {/* Bottom Navigation */}
        <Box
          textAlign="center"
          mt={{ xs: 6, md: 10 }}
          display="flex"
          justifyContent="center"
        >
          <Link
            href="/study-news"
            style={{ textDecoration: "none", width: "100%", maxWidth: "300px" }}
          >
            <Button
              component="span"
              variant="outlined"
              size="large"
              fullWidth // Ensures big tappable area on mobile
              sx={{
                borderRadius: 8,
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                borderWidth: "2px",
                "&:hover": {
                  borderWidth: "2px",
                  bgcolor: "primary.50",
                },
              }}
            >
              ← Back to Study News
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}