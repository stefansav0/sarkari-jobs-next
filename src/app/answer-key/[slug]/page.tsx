import { Metadata } from "next";
import { headers } from "next/headers";
import AnswerKeyClient from "./AnswerKeyClient";
import { AnswerKeyType } from "./AnswerKeyClient"; // Ensure this path matches where you export your type

/* ----------------------------------
   Fetch Single Answer Key by Slug
-----------------------------------*/
async function getAnswerKey(slug: string): Promise<AnswerKeyType | null> {
    const headersList = await headers();
    const host = headersList.get("host")!;
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    try {
        const res = await fetch(`${protocol}://${host}/api/answer-keys/${slug}`, {
            next: { revalidate: 60 }, // ISR caching
        });

        if (!res.ok) return null;

        const data = await res.json();
        // ✅ Extract the 'answerKey' object from the API response wrapper
        return data.answerKey || data;
    } catch (error) {
        console.error("Error fetching answer key:", error);
        return null;
    }
}

/* ----------------------------------
   SEO METADATA
-----------------------------------*/
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const answerKey = await getAnswerKey(slug);

    if (!answerKey) {
        return {
            title: "Answer Key Not Found | Finderight",
            description: "Requested answer key does not exist.",
            robots: { index: false, follow: false },
        };
    }

    const canonicalUrl = `https://finderight.com/answer-key/${answerKey.slug}`;
    const cleanDescription = answerKey.description?.replace(/<[^>]*>?/gm, '') || `Download official answer key and exam details for ${answerKey.title}.`;

    return {
        title: `${answerKey.title} | Answer Key`,
        description: cleanDescription.substring(0, 160),
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: answerKey.title,
            description: cleanDescription.substring(0, 160),
            url: canonicalUrl,
            siteName: "Finderight",
            type: "article",
            publishedTime: answerKey.publishDate || undefined,
            modifiedTime: answerKey.publishDate || undefined,
            locale: "en_US",
            images: [{ url: "https://finderight.com/og-default.png", width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: answerKey.title,
            description: cleanDescription.substring(0, 160),
            images: ["https://finderight.com/og-default.png"],
        },
        robots: { index: true, follow: true },
    };
}

/* --------------------------------------
   JSON-LD Schema
--------------------------------------- */
function AnswerKeyJsonLd(item: AnswerKeyType) {
    const url = `https://finderight.com/answer-key/${item.slug}`;
    const cleanDescription = item.description?.replace(/<[^>]*>?/gm, '') || `Download answer key for ${item.title}.`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        headline: item.title,
        description: cleanDescription,
        datePublished: item.publishDate || new Date().toISOString(),
        dateModified: item.publishDate || new Date().toISOString(),
        author: { "@type": "Organization", name: "Finderight" },
        publisher: {
            "@type": "Organization",
            name: "Finderight",
            logo: {
                "@type": "ImageObject",
                url: "https://finderight.com/logo.png",
            },
        },
    };

    const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://finderight.com" },
            { "@type": "ListItem", position: 2, name: "Answer Keys", item: "https://finderight.com/answer-key" },
            { "@type": "ListItem", position: 3, name: item.title, item: url },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        </>
    );
}

/* ----------------------------------
   PAGE COMPONENT
-----------------------------------*/
export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const answerKey = await getAnswerKey(slug);

    if (!answerKey) {
        return (
            <div className="flex flex-col justify-center items-center mt-20 min-h-[50vh] px-4">
                <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center max-w-md w-full shadow-sm">
                    <h1 className="text-3xl font-bold text-red-600 mb-3">Answer Key Not Found</h1>
                    <p className="text-gray-600 mb-6">This answer key may have been removed or the URL is incorrect.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {AnswerKeyJsonLd(answerKey)}
            <AnswerKeyClient answerKey={answerKey} />
        </>
    );
}