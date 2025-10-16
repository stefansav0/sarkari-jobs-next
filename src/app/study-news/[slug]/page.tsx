// src/app/study-news/[slug]/page.tsx
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
import Head from "next/head";

interface News {
    title: string;
    createdAt: string;
    description: string;
    coverImage?: string;
    author?: string;
}

export default async function StudyNewsDetail({
    params,
}: {
    params: { slug: string };
}) {
    const { slug } = params;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/study-news?slug=${slug}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        notFound(); // Show 404 page
    }

    const news: News = await res.json();

    // Fallback cover image (optional)
    const coverImage = news.coverImage || "https://finderight.com/default-cover.jpg";
    const descriptionText = stripHtml(news.description).slice(0, 160); // SEO description snippet

    // Structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: news.title,
        datePublished: news.createdAt,
        author: {
            "@type": "Person",
            name: news.author || "Finderight",
        },
        image: coverImage,
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
        description: descriptionText,
    };

    return (
        <>
            {/* SEO Head */}
            <Head>
                <title>{news.title} | Finderight</title>
                <meta name="description" content={descriptionText} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`https://finderight.com/study-news/${slug}`} />

                {/* Open Graph */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={news.title} />
                <meta property="og:description" content={descriptionText} />
                <meta property="og:image" content={coverImage} />
                <meta property="og:url" content={`https://finderight.com/study-news/${slug}`} />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={news.title} />
                <meta name="twitter:description" content={descriptionText} />
                <meta name="twitter:image" content={coverImage} />

                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </Head>

            <Container maxWidth="md" sx={{ py: 6 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 4,
                        boxShadow: 6,
                        backgroundColor: "#ffffff",
                    }}
                >
                    {/* Title */}
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#1a202c" }}>
                        {news.title}
                    </Typography>

                    {/* Date and Author */}
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Published on {new Date(news.createdAt).toLocaleDateString("en-GB")}
                        {news.author ? ` by ${news.author}` : ""}
                    </Typography>

                    {/* Optional Cover Image */}
                    {news.coverImage && (
                        <Box
                            component="img"
                            src={coverImage}
                            alt={news.title}
                            sx={{
                                width: "100%",
                                maxHeight: 400,
                                objectFit: "cover",
                                borderRadius: 2,
                                my: 3,
                            }}
                        />
                    )}

                    <Divider sx={{ my: 3 }} />

                    {/* Rich Text Body */}
                    <Box
                        sx={{
                            mt: 2,
                            fontSize: "1rem",
                            lineHeight: 1.8,
                            "& table": {
                                width: "100%",
                                borderCollapse: "collapse",
                                marginY: 2,
                            },
                            "& th, & td": {
                                border: "1px solid #ddd",
                                padding: "10px",
                                textAlign: "left",
                            },
                            "& th": {
                                backgroundColor: "#f0f0f0",
                                fontWeight: 600,
                            },
                            "& a": {
                                color: "#1976d2",
                                textDecoration: "underline",
                                fontWeight: 500,
                            },
                            "& ul": {
                                paddingLeft: 3,
                                marginTop: 1,
                            },
                            "& p": {
                                marginBottom: 2,
                            },
                        }}
                        dangerouslySetInnerHTML={{ __html: news.description }}
                    />

                    <Divider sx={{ my: 4 }} />

                    {/* Tag */}
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        <Chip label="Study News" color="primary" />
                    </Box>
                </Paper>

                {/* Back Link */}
                <Box mt={4} textAlign="center">
                    <Link href="/study-news" style={{ color: "#1976d2", fontWeight: 500 }}>
                        ← Back to Study News
                    </Link>
                </Box>
            </Container>
        </>
    );
}

// Strip HTML tags for meta description
function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
