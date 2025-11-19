import React from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink } from "lucide-react";
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
   Fetch Single Result
--------------------------------------- */
async function getResult(slug: string): Promise<ResultType | null> {
  const headersList = headers();
  const host = (await headersList).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/results/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data && data.slug ? data : null;
}

/* --------------------------------------
   Advanced SEO Metadata Generator
--------------------------------------- */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getResult(slug);

  if (!result) {
    return {
      title: "Result Not Found | Finderight",
      description: "Requested examination result could not be found.",
      robots: "noindex, nofollow",
    };
  }

  const canonicalUrl = `https://finderight.com/result/${result.slug}`;

  return {
    title: `${result.title} | Finderight Result`,
    description:
      result.shortInfo ||
      `Check the latest exam result, official links, and important details for ${result.title}.`,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: result.title,
      description:
        result.shortInfo ||
        `Get complete details for ${result.title} including links and important dates.`,
      url: canonicalUrl,
      type: "article",
      siteName: "Finderight",
      publishedTime: result.postDate || undefined,
      modifiedTime: result.postDate || undefined,
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
      description:
        result.shortInfo ||
        `Latest result update for ${result.title}.`,
      images: ["https://finderight.com/og-result.png"],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

/* --------------------------------------
   JSON-LD Schema — Article + Breadcrumb
--------------------------------------- */
function JsonLdSchemas(result: ResultType) {
  const canonicalUrl = `https://finderight.com/result/${result.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: result.title,
    description:
      result.shortInfo ||
      `Find latest result information for ${result.title}.`,
    datePublished: result.postDate || undefined,
    dateModified: result.postDate || undefined,
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
    url: canonicalUrl,
  };

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
        name: "Result",
        item: "https://finderight.com/result",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: result.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

/* --------------------------------------
   Page Component
--------------------------------------- */
const ResultDetailPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const result = await getResult(slug);

  if (!result) {
    return (
      <div className="text-center text-red-500 mt-8">
        Result not found or failed to load.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      {/* SEO JSON-LD */}
      {JsonLdSchemas(result)}

      <h1 className="text-3xl font-bold text-blue-700 mb-4">{result.title}</h1>

      <div className="space-y-2 text-gray-700 text-sm mb-6">
        {result.conductedBy && (
          <p>
            <strong>Conducted By:</strong> {result.conductedBy}
          </p>
        )}

        {result.examDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Exam Date: {result.examDate}
          </p>
        )}

        {result.resultDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Result Date: {result.resultDate}
          </p>
        )}

        {result.postDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Published On: {new Date(result.postDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Notice */}
      {result.shortInfo && (
        <section className="border p-4 rounded mb-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Notice</h2>
          <p>{result.shortInfo}</p>
        </section>
      )}

      {/* How to Check */}
      {result.howToCheck && (
        <section className="border p-4 rounded mb-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">
            How to Check Result
          </h2>
          <p>{result.howToCheck}</p>
        </section>
      )}

      {/* Important Links */}
      {Array.isArray(result.importantLinks) &&
        result.importantLinks.length > 0 && (
          <section className="border p-4 rounded mb-4 bg-white">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">
              Important Links
            </h2>
            <ul className="space-y-2">
              {result.importantLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    {link.label} <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

      {/* Back */}
      <div className="text-center mt-6">
        <Link
          href="/result"
          className="text-blue-600 hover:underline font-medium"
        >
          ← Back to Results
        </Link>
      </div>

      <div className="text-center mt-8 text-sm text-gray-700">
        <p className="font-semibold text-lg mb-2 text-blue-600">
          Welcome to Finderight!
        </p>
        <p className="mb-4">
          Get updates on Jobs, Results, Admissions, Answer Keys, News & more.
          Bookmark Finderight and stay updated.
        </p>

        <hr className="my-4" />

        <p className="text-red-600 text-xs">
          <strong>Disclaimer:</strong> All information is for educational
          purposes only. Verify info with official sources.
        </p>
      </div>
    </main>
  );
};

export default ResultDetailPage;
