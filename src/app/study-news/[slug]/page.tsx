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
   Strip HTML for meta description
-------------------------------- */
function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
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
   Fetch Related Articles (Top 5)
-------------------------------- */
async function getRelated(slug: string): Promise<News[]> {
    const base =
        process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.finderight.com";

    const res = await fetch(`${base}/api/study-news?page=1`, {
        cache: "no-store",
    });

    const data = await res.json();

    if (!data.newsList || !Array.isArray(data.newsList)) return [];

    // Filter current article
    return data.newsList
        .filter((item: News) => item.slug !== slug)
        .slice(0, 5);
}

/* -------------------------------
   SEO Metadata
-------------------------------- */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const news = await getNews(slug);

    if (!news) {
        return {
            title: "Study News Not Found | Finderight",
            description: "Requested study news article does not exist.",
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
            images: [cover],
            siteName: "Finderight",
            publishedTime: news.createdAt,
            authors: news.author ? [news.author] : ["Finderight"],
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
   Page Render
-------------------------------- */
export default async function StudyNewsDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const news = await getNews(slug);

    if (!news) return notFound();

    const related = await getRelated(slug);
    const coverImage = news.coverImage || "/default-cover.jpg";

    /* Structured Data JSON-LD */
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: news.title,
        datePublished: news.createdAt,
        description: stripHtml(news.description).slice(0, 160),
        image: coverImage,
        author: { "@type": "Person", name: news.author || "Finderight" },
        publisher: {
            "@type": "Organization",
            name: "Finderight",
            logo: { "@type": "ImageObject", url: "https://finderight.com/logo.png" },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://finderight.com/study-news/${slug}`,
        },
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Box display="grid" gridTemplateColumns={{ md: "3fr 1fr" }} gap={4}>
                    {/* ---------- LEFT: MAIN ARTICLE ---------- */}
                    <Paper
                        elevation={3}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            borderRadius: 4,
                            backgroundColor: "#ffffff",
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                            {news.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Published on{" "}
                            {new Date(news.createdAt).toLocaleDateString("en-GB")} by{" "}
                            {news.author || "Admin"}
                        </Typography>

                        {news.coverImage && (
                            <Box
                                component="img"
                                src={coverImage}
                                alt={news.title}
                                sx={{
                                    width: "100%",
                                    borderRadius: 3,
                                    my: 3,
                                    maxHeight: 420,
                                    objectFit: "cover",
                                }}
                            />
                        )}

                        <Divider sx={{ my: 3 }} />

                        <Box
                            sx={{
                                lineHeight: 1.8,
                                fontSize: "1.05rem",
                                "& img": { maxWidth: "100%", borderRadius: 2 },
                                "& table": { width: "100%", borderCollapse: "collapse", my: 2 },
                                "& th, & td": {
                                    border: "1px solid #ddd",
                                    padding: "10px",
                                    textAlign: "left",
                                },
                            }}
                            dangerouslySetInnerHTML={{ __html: news.description }}
                        />

                        <Divider sx={{ my: 4 }} />

                        <Chip label="Study News" color="primary" />
                    </Paper>

                    {/* ---------- RIGHT: RELATED ARTICLES ---------- */}
                    <Box sx={{ position: "sticky", top: 120 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Related Articles
                        </Typography>

                        {related.length === 0 ? (
                            <Typography color="text.secondary">
                                No related articles found.
                            </Typography>
                        ) : (
                            <Box display="flex" flexDirection="column" gap={2}>
                                {related.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={`/study-news/${item.slug}`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <Paper
                                            elevation={2}
                                            sx={{
                                                display: "flex",
                                                gap: 2,
                                                p: 2,
                                                borderRadius: 3,
                                                cursor: "pointer",
                                                transition: "0.2s",
                                                "&:hover": {
                                                    transform: "scale(1.02)",
                                                    boxShadow: 6,
                                                },
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={item.coverImage || "/default-cover.jpg"}
                                                alt={item.title}
                                                sx={{
                                                    width: 80,
                                                    height: 70,
                                                    borderRadius: 2,
                                                    objectFit: "cover",
                                                }}
                                            />

                                            <Box>
                                                <Typography
                                                    fontSize="0.95rem"
                                                    fontWeight="bold"
                                                    sx={{ color: "#1a1a1a" }}
                                                >
                                                    {item.title}
                                                </Typography>

                                                <Typography
                                                    fontSize="0.8rem"
                                                    color="text.secondary"
                                                >
                                                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Link>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>

                <Box textAlign="center" mt={4}>
                    <Link href="/study-news" style={{ color: "#1976d2", fontWeight: 500 }}>
                        ← Back to Study News
                    </Link>
                </Box>
            </Container>
        </>
    );
}
