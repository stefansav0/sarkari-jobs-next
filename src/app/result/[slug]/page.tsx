// src/app/result/[slug]/page.tsx

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { headers } from "next/headers";
import { Metadata } from "next";

/* --------------------------------------
   Types
--------------------------------------- */
interface ImportantLink {
  label: string;
  url: string;
}

interface ResultType {
  slug: string;
  title: string;
  conductedBy?: string;
  examDate?: string;
  resultDate?: string;
  postDate?: string;
  shortInfo?: string;
  howToCheck?: string;
  importantLinks?: ImportantLink[];
}

/* --------------------------------------
   Fetch Single Result (NO CACHE)
--------------------------------------- */
async function getResult(slug: string): Promise<ResultType | null> {
  const headersList = headers();
  const host = (await headersList).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/results/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

/* --------------------------------------
   SEO Metadata (HIGH CTR FORMAT)
--------------------------------------- */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const result = await getResult(params.slug);

  if (!result) {
    return {
      title: "Result Not Found | Finderight",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `https://finderight.com/result/${result.slug}`;

  return {
    title: `${result.title} – Download Result, Cut Off, Merit List`,
    description:
      result.shortInfo ||
      `Check ${result.title} result, official download link, cut off marks, merit list and full details on Finderight.`,

    alternates: { canonical },

    openGraph: {
      type: "article",
      title: result.title,
      description: result.shortInfo,
      url: canonical,
      siteName: "Finderight",
      publishedTime: result.postDate,
      modifiedTime: result.postDate,
      images: [
        {
          url: "https://finderight.com/og-result.png",
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: result.title,
      description: result.shortInfo,
      images: ["https://finderight.com/og-result.png"],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

/* --------------------------------------
   JSON-LD (NEWS + FAQ + BREADCRUMB)
--------------------------------------- */
function JsonLdSchemas(result: ResultType) {
  const url = `https://finderight.com/result/${result.slug}`;

  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: result.title,
    description: result.shortInfo,
    datePublished: result.postDate,
    dateModified: result.postDate,
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
  };

  const faqSchema = result.howToCheck
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How to check result?",
            acceptedAnswer: {
              "@type": "Answer",
              text: result.howToCheck,
            },
          },
        ],
      }
    : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://finderight.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Results",
        item: "https://finderight.com/result",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: result.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}

/* --------------------------------------
   Page Component
--------------------------------------- */
export default async function ResultDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const result = await getResult(params.slug);

  if (!result) {
    return (
      <div className="text-center mt-10 text-red-600">
        Result not found.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      {JsonLdSchemas(result)}

      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        {result.title}
      </h1>

      <div className="text-sm text-gray-700 space-y-2 mb-6">
        {result.conductedBy && (
          <p>
            <strong>Conducted By:</strong> {result.conductedBy}
          </p>
        )}
        {result.examDate && <p>📅 Exam Date: {result.examDate}</p>}
        {result.resultDate && <p>📢 Result Date: {result.resultDate}</p>}
      </div>

      {result.shortInfo && (
        <section className="bg-gray-50 border p-4 rounded mb-4">
          <h2 className="font-semibold text-blue-600 mb-2">
            Latest Update
          </h2>
          <p>{result.shortInfo}</p>
        </section>
      )}

      {result.howToCheck && (
        <section className="bg-white border p-4 rounded mb-4">
          <h2 className="font-semibold text-blue-600 mb-2">
            How to Check Result
          </h2>
          <p>{result.howToCheck}</p>
        </section>
      )}

      {result.importantLinks?.length ? (
        <section className="border p-4 rounded">
          <h2 className="font-semibold text-blue-600 mb-2">
            Important Links
          </h2>
          <ul className="space-y-2">
            {result.importantLinks.map((l, i) => (
              <li key={i}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 flex items-center"
                >
                  {l.label}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 text-center">
        <Link href="/result" className="text-blue-600 hover:underline">
          ← Back to Results
        </Link>
      </div>
    </main>
  );
}
