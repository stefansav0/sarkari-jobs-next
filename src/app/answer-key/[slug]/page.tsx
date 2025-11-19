import { Metadata } from "next";
import { headers } from "next/headers";
import AnswerKeyClient from "./AnswerKeyClient";
import { AnswerKeyType } from "@/types/answerKey"; // MUST exist

/* ----------------------------------
   Fetch Single Answer Key by Slug
-----------------------------------*/
async function getAnswerKey(slug: string): Promise<AnswerKeyType | null> {
    const headersList = await headers();
    const host = headersList.get("host")!;
    const protocol =
        process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/answer-keys/${slug}`, {
        next: { revalidate: 60 }, // ISR caching
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data && data.slug ? (data as AnswerKeyType) : null;
}

/* ----------------------------------
   SEO METADATA (params MUST be awaited)
-----------------------------------*/
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params; // ✔ FIXED
    const answerKey = await getAnswerKey(slug);

    if (!answerKey) {
        return {
            title: "Answer Key Not Found | Finderight",
            description: "Requested answer key does not exist.",
        };
    }

    const canonicalUrl = `https://finderight.com/answer-key/${answerKey.slug}`;

    return {
        title: `${answerKey.title} | Answer Key`,
        description:
            answerKey.description ||
            `Check official answer key, exam details, and download links for ${answerKey.title}.`,

        alternates: { canonical: canonicalUrl },

        openGraph: {
            title: answerKey.title,
            description:
                answerKey.description ||
                `Download official answer key and exam details for ${answerKey.title}.`,
            url: canonicalUrl,
            siteName: "Finderight",
            type: "article",
            publishedTime: answerKey.publishDate || undefined,
            modifiedTime: answerKey.publishDate || undefined,
            locale: "en_US",
        },

        twitter: {
            card: "summary_large_image",
            title: answerKey.title,
            description:
                answerKey.description ||
                `Latest answer key released for ${answerKey.title}.`,
        },
    };
}

/* ----------------------------------
   PAGE COMPONENT (params MUST be awaited)
-----------------------------------*/
export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params; // ✔ FIXED
    const answerKey = await getAnswerKey(slug);

    if (!answerKey) {
        return (
            <div className="text-center text-red-600 mt-8">
                Answer Key not found.
            </div>
        );
    }

    return <AnswerKeyClient answerKey={answerKey} />;
}
