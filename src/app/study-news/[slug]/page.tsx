// src/app/study-news/[slug]/page.tsx

import React from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Box,
  Typography,
  Container,
  Chip,
  Paper,
  Button,
} from "@mui/material";

import { notFound } from "next/navigation";
import type { Metadata } from "next";

/* =========================================
   TYPES
========================================= */
interface News {
  title: string;

  slug: string;

  description: string;

  createdAt: string;

  updatedAt?: string;

  author?: string;

  coverImage?: string;

  imageUrl?: string;

  metaDescription?: string;

  seoTitle?: string;

  keywords?: string[];

  visibility?: string;
}

/* =========================================
   HELPERS
========================================= */

// Decode HTML
function unescapeHTML(
  str: string
): string {
  if (!str) return "";

  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'");
}

// Strip HTML
function stripHtml(
  html: string
): string {
  if (!html) return "";

  const unescaped =
    unescapeHTML(html);

  return unescaped
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract array
function extractArray(
  input: unknown
): News[] {
  if (Array.isArray(input)) {
    return input as News[];
  }

  if (
    input &&
    typeof input === "object"
  ) {
    const record =
      input as Record<
        string,
        unknown
      >;

    for (const key in record) {
      const found = extractArray(
        record[key]
      );

      if (found.length)
        return found;
    }
  }

  return [];
}

/* =========================================
   FETCH HELPERS
========================================= */

async function getNews(
  slug: string
): Promise<News | null> {
  const base =
    process.env
      .NEXT_PUBLIC_API_BASE_URL ||
    "https://www.finderight.com";

  const res = await fetch(
    `${base}/api/study-news?slug=${slug}`,
    {
      next: {
        tags: [
          "study-news",
          `study-news-${slug}`,
        ],
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();

  return data.news || data;
}

async function getRelated(
  slug: string
): Promise<News[]> {
  const base =
    process.env
      .NEXT_PUBLIC_API_BASE_URL ||
    "https://www.finderight.com";

  const res = await fetch(
    `${base}/api/study-news?page=1&limit=10&visibility=published`,
    {
      next: {
        tags: ["study-news"],
      },
    }
  );

  if (!res.ok) return [];

  const data: unknown =
    await res.json();

  const list =
    extractArray(data);

  return list
    .filter(
      (n) => n.slug !== slug
    )
    .slice(0, 5);
}

/* =========================================
   STATIC PARAMS
========================================= */
export async function generateStaticParams() {
  const base =
    process.env
      .NEXT_PUBLIC_API_BASE_URL ||
    "https://www.finderight.com";

  const res = await fetch(
    `${base}/api/study-news?page=1&limit=50&visibility=published`,
    {
      next: {
        tags: ["study-news"],
      },
    }
  );

  if (!res.ok) return [];

  const data: unknown =
    await res.json();

  const articles =
    extractArray(data);

  return articles.map(
    (article) => ({
      slug: article.slug,
    })
  );
}

/* =========================================
   SEO METADATA
========================================= */
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } =
    await params;

  const news =
    await getNews(slug);

  if (
    !news ||
    news.visibility === "draft"
  ) {
    return {
      title:
        "Article Not Found | Finderight",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    news.metaDescription ||
    stripHtml(
      news.description
    ).slice(0, 160);

  const title =
    news.seoTitle ||
    `${news.title} | Finderight`;

  const cover =
    news.coverImage ||
    news.imageUrl ||
    "https://finderight.com/default-cover.jpg";

  const canonicalUrl =
    `https://finderight.com/study-news/${slug}`;

  return {
    title,

    description,

    keywords:
      news.keywords || [],

    alternates: {
      canonical:
        canonicalUrl,
    },

    openGraph: {
      title,

      description,

      url: canonicalUrl,

      type: "article",

      siteName:
        "Finderight",

      publishedTime:
        news.createdAt,

      modifiedTime:
        news.updatedAt,

      authors: [
        news.author ||
          "Finderight",
      ],

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
      card:
        "summary_large_image",

      title,

      description,

      images: [cover],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

/* =========================================
   PAGE
========================================= */
export default async function StudyNewsDetail({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } =
    await params;

  const news =
    await getNews(slug);

  // 404
  if (
    !news ||
    news.visibility === "draft"
  ) {
    return notFound();
  }

  const related =
    await getRelated(slug);

  const coverImage =
    news.coverImage ||
    news.imageUrl ||
    "/default-cover.jpg";

  const cleanHtmlContent =
    unescapeHTML(
      news.description
    );

  /* =========================================
     JSON-LD SEO
  ========================================= */
  const structuredData = {
    "@context":
      "https://schema.org",

    "@type":
      "NewsArticle",

    headline: news.title,

    description:
      news.metaDescription ||
      stripHtml(
        news.description
      ).slice(0, 160),

    image: [coverImage],

    datePublished:
      news.createdAt,

    dateModified:
      news.updatedAt ||
      news.createdAt,

    author: {
      "@type": "Person",
      name:
        news.author ||
        "Finderight",
    },

    publisher: {
      "@type":
        "Organization",

      name: "Finderight",

      logo: {
        "@type":
          "ImageObject",

        url: "https://finderight.com/logo.png",
      },
    },

    mainEntityOfPage: {
      "@type": "WebPage",

      "@id":
        `https://finderight.com/study-news/${slug}`,
    },
  };

  return (
    <Box
      sx={{
        bgcolor: "grey.50",
        minHeight: "100vh",
        pb: {
          xs: 6,
          md: 10,
        },
      }}
    >

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ),
        }}
      />

      {/* HERO */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg,#1976d2 0%,#0d47a1 100%)",

          color: "white",

          pt: {
            xs: 8,
            md: 12,
          },

          pb: {
            xs: 10,
            md: 16,
          },

          px: 2,

          textAlign: "center",
        }}
      >
        <Container maxWidth="md">

          <Chip
            label="Study News"
            sx={{
              mb: 3,

              bgcolor:
                "rgba(255,255,255,0.15)",

              color: "white",

              fontWeight: 700,
            }}
          />

          <Typography
            variant="h3"
            component="h1"
            fontWeight={800}
            lineHeight={1.3}
            mb={3}
            sx={{
              fontSize: {
                xs: "2rem",
                md: "3.5rem",
              },
            }}
          >
            {news.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              opacity: 0.92,

              fontWeight: 500,
            }}
          >
            Published on{" "}
            {new Date(
              news.createdAt
            ).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}

            {" • "}

            By{" "}
            {news.author ||
              "Finderight"}
          </Typography>

        </Container>
      </Box>

      {/* MAIN */}
      <Container
        maxWidth="xl"
        sx={{
          mt: {
            xs: -6,
            md: -10,
          },
        }}
      >

        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            lg: "7fr 3fr",
          }}
          gap={5}
        >

          {/* ARTICLE */}
          <Paper
            elevation={4}
            sx={{
              p: {
                xs: 2.5,
                md: 6,
              },

              borderRadius: 4,

              overflow: "hidden",
            }}
          >

            {/* COVER IMAGE */}
            <Box
              sx={{
                width: "100%",

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
                sizes="(max-width:768px)100vw,1200px"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </Box>

            {/* CONTENT */}
            <Box
              sx={{
                maxWidth: "80ch",

                mx: "auto",

                fontSize: {
                  xs: "1.05rem",
                  md: "1.15rem",
                },

                lineHeight: 1.9,

                color: "text.primary",

                fontFamily:
                  '"Merriweather", Georgia, serif',

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
                  mb: 3,
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

                "& ul,& ol": {
                  pl: 3,
                  mb: 3,
                },

                "& li": {
                  mb: 1,
                },

                "& a": {
                  color:
                    "primary.main",

                  textDecoration:
                    "none",

                  fontWeight: 600,
                },

                "& a:hover": {
                  textDecoration:
                    "underline",
                },

                "& blockquote": {
                  borderLeft:
                    "4px solid",

                  borderColor:
                    "primary.main",

                  pl: 3,

                  py: 2,

                  my: 4,

                  bgcolor:
                    "grey.100",

                  borderRadius:
                    "0 10px 10px 0",

                  fontStyle:
                    "italic",
                },
              }}
              dangerouslySetInnerHTML={{
                __html:
                  cleanHtmlContent,
              }}
            />

          </Paper>

          {/* SIDEBAR */}
          <Box
            sx={{
              position: {
                lg: "sticky",
              },

              top: {
                lg: 30,
              },
            }}
          >

            <Typography
              variant="h5"
              fontWeight={800}
              mb={3}
            >
              Related Articles
            </Typography>

            <Box
              display="flex"
              flexDirection="column"
              gap={2}
            >

              {related.map(
                (item) => (
                  <Link
                    key={item.slug}
                    href={`/study-news/${item.slug}`}
                    style={{
                      textDecoration:
                        "none",
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,

                        borderRadius: 3,

                        border:
                          "1px solid",

                        borderColor:
                          "divider",

                        transition:
                          "all .3s",

                        "&:hover": {
                          borderColor:
                            "primary.main",

                          boxShadow:
                            "0 8px 24px rgba(25,118,210,.12)",

                          transform:
                            "translateY(-2px)",
                        },
                      }}
                    >

                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        lineHeight={1.4}
                        mb={1}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </Typography>

                    </Paper>
                  </Link>
                )
              )}

            </Box>

            {related.length ===
              0 && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                No related articles found.
              </Typography>
            )}

          </Box>

        </Box>

        {/* BACK BUTTON */}
        <Box
          textAlign="center"
          mt={{
            xs: 6,
            md: 10,
          }}
        >

          <Link
            href="/study-news"
            style={{
              textDecoration:
                "none",
            }}
          >
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 8,

                px: 5,

                py: 1.5,

                textTransform:
                  "none",

                fontWeight: 700,
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