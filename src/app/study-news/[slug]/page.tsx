import React from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Container,
  Chip,
  Paper,
  Button,
  Divider,
} from "@mui/material";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";

/* -------------------------------
   Types
-------------------------------- */
interface News {
  title: string;
  createdAt: string;
  updatedAt?: string;
  description: string;
  coverImage?: string;
  author?: string;
  slug: string;
  metaDescription?: string;
  keywords?: string;
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

  return unescaped
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

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
   API Helpers
-------------------------------- */
async function getNews(slug: string): Promise<News | null> {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://www.finderight.com";

  const res = await fetch(
    `${base}/api/study-news?slug=${slug}`,
    {
      next: {
        tags: ["study-news", `study-news-${slug}`],
      },
    }
  );

  if (!res.ok) return null;

  return res.json();
}

async function getRelated(slug: string): Promise<News[]> {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://www.finderight.com";

  const res = await fetch(
    `${base}/api/study-news?page=1&limit=10`,
    {
      next: {
        tags: ["study-news"],
      },
    }
  );

  if (!res.ok) return [];

  const data: unknown = await res.json();

  const list = extractArray(data);

  return list
    .filter((item) => item.slug !== slug)
    .slice(0, 5);
}

/* -------------------------------
   Static Params
-------------------------------- */
export async function generateStaticParams() {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://www.finderight.com";

  const res = await fetch(
    `${base}/api/study-news?page=1&limit=50`,
    {
      next: {
        tags: ["study-news"],
      },
    }
  );

  if (!res.ok) return [];

  const data: unknown = await res.json();

  const articles = extractArray(data);

  return articles.map((article) => ({
    slug: article.slug,
  }));
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
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cleanDescription =
    news.metaDescription ||
    stripHtml(news.description).slice(0, 160);

  const keywords =
    news.keywords
      ?.split(",")
      .map((k) => k.trim())
      .filter(Boolean) || [];

  const canonicalUrl = `https://www.finderight.com/study-news/${slug}`;

  const cover =
    news.coverImage ||
    "https://www.finderight.com/default-cover.jpg";

  return {
    title: `${news.title} | Finderight`,
    description: cleanDescription,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: news.title,
      description: cleanDescription,
      url: canonicalUrl,
      type: "article",
      siteName: "Finderight",
      publishedTime: news.createdAt,
      modifiedTime: news.updatedAt || news.createdAt,
      images: [
        {
          url: cover,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: news.title,
      description: cleanDescription,
      images: [cover],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

/* -------------------------------
   Page
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

  const coverImage =
    news.coverImage || "/default-cover.jpg";

  const cleanHtmlContent = unescapeHTML(
    news.description
  );

  const seoDescription =
    news.metaDescription ||
    stripHtml(news.description).slice(0, 160);

  const keywordList =
    news.keywords
      ?.split(",")
      .map((k) => k.trim())
      .filter(Boolean) || [];

  /* -------------------------------
     Structured Data
  -------------------------------- */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: seoDescription,
    image: [coverImage],
    datePublished: news.createdAt,
    dateModified: news.updatedAt || news.createdAt,

    author: {
      "@type": "Organization",
      name: "Finderight",
    },

    publisher: {
      "@type": "Organization",
      name: "Finderight",
      logo: {
        "@type": "ImageObject",
        url: "https://www.finderight.com/logo.png",
      },
    },

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.finderight.com/study-news/${slug}`,
    },

    keywords: keywordList.join(", "),
  };

  return (
    <Box
      sx={{
        bgcolor: "#f8fafc",
        minHeight: "100vh",
        pb: { xs: 6, md: 10 },
      }}
    >
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Hero */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
          color: "#fff",
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
          px: 2,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Chip
            label="Study News"
            sx={{
              mb: 3,
              bgcolor: "rgba(255,255,255,0.15)",
              color: "#fff",
              fontWeight: 700,
              backdropFilter: "blur(8px)",
            }}
          />

          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "2rem",
                sm: "2.5rem",
                md: "3.5rem",
              },
              fontWeight: 800,
              lineHeight: 1.2,
              mb: 3,
            }}
          >
            {news.title}
          </Typography>

          <Typography
            sx={{
              opacity: 0.9,
              fontSize: {
                xs: "0.95rem",
                md: "1rem",
              },
            }}
          >
            Published on{" "}
            {new Date(news.createdAt).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}{" "}
            • By {news.author || "Finderight News Desk"}
          </Typography>
        </Container>
      </Box>

      {/* Main */}
      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: -6, md: -10 },
          px: { xs: 1.5, sm: 3 },
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            lg: "7fr 3fr",
          }}
          gap={{ xs: 4, lg: 5 }}
        >
          {/* Article */}
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2.5, md: 5 },
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            {/* Cover */}
            <Box
              sx={{
                overflow: "hidden",
                borderRadius: 4,
                mb: 5,
              }}
            >
              <Image
                src={coverImage}
                alt={news.title}
                width={1200}
                height={650}
                priority
                sizes="(max-width:768px) 100vw, 1200px"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </Box>

            {/* SEO Description */}
            {news.metaDescription && (
              <Box
                sx={{
                  mb: 4,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1rem",
                    lineHeight: 1.8,
                    color: "#334155",
                    fontWeight: 500,
                  }}
                >
                  {news.metaDescription}
                </Typography>
              </Box>
            )}

            {/* Content */}
            <Box
              sx={{
                fontSize: {
                  xs: "1.05rem",
                  md: "1.12rem",
                },
                lineHeight: 1.9,
                color: "#1e293b",

                "& p": {
                  mb: 3,
                },

                "& h2": {
                  fontSize: {
                    xs: "1.5rem",
                    md: "2rem",
                  },
                  fontWeight: 800,
                  mt: 5,
                  mb: 2,
                  lineHeight: 1.3,
                },

                "& h3": {
                  fontSize: {
                    xs: "1.25rem",
                    md: "1.6rem",
                  },
                  fontWeight: 700,
                  mt: 4,
                  mb: 2,
                },

                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 3,
                  my: 4,
                },

                "& ul, & ol": {
                  pl: 3,
                  mb: 3,
                },

                "& li": {
                  mb: 1.2,
                },

                "& a": {
                  color: "#2563eb",
                  fontWeight: 600,
                  textDecoration: "none",
                },

                "& a:hover": {
                  textDecoration: "underline",
                },

                "& blockquote": {
                  borderLeft: "4px solid #2563eb",
                  pl: 3,
                  py: 1.5,
                  my: 4,
                  bgcolor: "#eff6ff",
                  borderRadius: "0 12px 12px 0",
                  fontStyle: "italic",
                },
              }}
              dangerouslySetInnerHTML={{
                __html: cleanHtmlContent,
              }}
            />

            {/* Keywords */}
            {keywordList.length > 0 && (
              <>
                <Divider sx={{ my: 5 }} />

                <Typography
                  variant="h6"
                  fontWeight={700}
                  mb={2}
                >
                  Tags
                </Typography>

                <Box
                  display="flex"
                  flexWrap="wrap"
                  gap={1.5}
                >
                  {keywordList.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      sx={{
                        bgcolor: "#eff6ff",
                        color: "#2563eb",
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Paper>

          {/* Sidebar */}
          <Box
            sx={{
              position: {
                lg: "sticky",
              },
              top: {
                lg: 32,
              },
              height: "fit-content",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={800}
              mb={3}
            >
              Related Reads
            </Typography>

            <Box
              display="flex"
              flexDirection="column"
              gap={2}
            >
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/study-news/${item.slug}`}
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                      transition: "0.25s",

                      "&:hover": {
                        borderColor: "#2563eb",
                        transform: "translateY(-3px)",
                        boxShadow:
                          "0 10px 25px rgba(37,99,235,0.12)",
                      },
                    }}
                  >
                    <Typography
                      fontWeight={700}
                      lineHeight={1.5}
                      mb={1}
                      color="text.primary"
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Typography>
                  </Paper>
                </Link>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Back Button */}
        <Box
          textAlign="center"
          mt={{ xs: 6, md: 10 }}
        >
          <Link
            href="/study-news"
            style={{
              textDecoration: "none",
            }}
          >
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 999,
                px: 5,
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
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