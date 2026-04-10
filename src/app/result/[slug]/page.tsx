import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";

/* --------------------------------------
   Types
--------------------------------------- */
interface ImportantLinks {
  downloadResult?: { label: string; url: string }[];
  officialWebsite?: string;
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
  importantLinks?: ImportantLinks;
}

// Safe HTML Decoder for the text fields
function decodeHtml(html?: string) {
  if (!html) return "";
  return html.replace(/\\u003C/g, "<").replace(/\\u003E/g, ">").replace(/\\u002F/g, "/");
}

/* --------------------------------------
   Fetch Single Result (NO CACHE)
--------------------------------------- */
async function getResult(slug: string): Promise<ResultType | null> {
  const headersList = headers();
  const host = (await headersList).get("host");

  if (!host) return null;

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/results/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    
    const data = await res.json();
    
    // ✅ CRITICAL FIX: Extract the 'result' object from the new API response wrapper
    return data.result || data; 
  } catch (error) {
    console.error("Error fetching result:", error);
    return null;
  }
}

/* --------------------------------------
   SEO Metadata
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
      robots: { index: false, follow: false },
    };
  }

  const canonical = `https://finderight.com/result/${result.slug}`;
  // Strip HTML tags for the meta description
  const cleanDescription = result.shortInfo?.replace(/<[^>]*>?/gm, '') || `Check ${result.title} result, cut off marks, merit list and full details on Finderight.`;

  return {
    title: `${result.title} – Download Result, Cut Off, Merit List`,
    description: cleanDescription.substring(0, 160),
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: result.title,
      description: cleanDescription.substring(0, 160),
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
      description: cleanDescription.substring(0, 160),
      images: ["https://finderight.com/og-result.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/* --------------------------------------
   JSON-LD Schemas
--------------------------------------- */
function JsonLdSchemas(result: ResultType) {
  const url = `https://finderight.com/result/${result.slug}`;
  const cleanDescription = result.shortInfo?.replace(/<[^>]*>?/gm, '') || result.title;

  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: result.title,
    description: cleanDescription,
    datePublished: result.postDate,
    dateModified: result.postDate,
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

  const faqSchema = result.howToCheck
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How to check the result?",
            acceptedAnswer: {
              "@type": "Answer",
              text: result.howToCheck.replace(/<[^>]*>?/gm, ''), // Strip HTML for schema
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
    </>
  );
}

/* --------------------------------------
   Page Component (Server Rendered)
--------------------------------------- */
export default async function ResultDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getResult(slug);

  if (!result) {
    return (
      <div className="text-center mt-20 min-h-[50vh]">
        <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Result Not Found</h1>
        <p className="text-gray-600 mb-6">The result you are looking for does not exist or has been removed.</p>
        <Link href="/result" className="text-blue-600 hover:underline">
          ← Back to All Results
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-4xl bg-white shadow-xl rounded-xl my-10">
      {JsonLdSchemas(result)}

      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-4">
        {result.title}
      </h1>
      
      {result.conductedBy && (
        <p className="text-center text-lg text-indigo-700 font-semibold mb-8">
          Conducted By: {result.conductedBy}
        </p>
      )}

      {/* TOP INFO TABLE */}
      <section className="mb-8 border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm md:text-base">
          <tbody>
            <tr className="border-b">
              <td className="w-1/3 font-bold text-red-600 p-3 bg-red-50">Post Name:</td>
              <td className="p-3 text-blue-700 font-semibold">{result.title}</td>
            </tr>
            <tr className="border-b">
              <td className="font-bold text-red-600 p-3 bg-red-50">Post Date:</td>
              <td className="p-3">
                {result.postDate ? new Date(result.postDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' }) : "—"}
              </td>
            </tr>
            <tr>
              <td className="font-bold text-red-600 p-3 bg-red-50 align-top">Short Info:</td>
              <td className="p-3 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: decodeHtml(result.shortInfo) }} />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* TIMELINE DATES */}
      <section className="mb-8 border rounded-lg overflow-hidden shadow-sm">
        <h2 className="text-xl font-bold text-center text-white bg-green-600 py-2">Important Dates</h2>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-700">Exam Date:</span>
            <span className="text-gray-900 font-medium">
              {result.examDate ? new Date(result.examDate).toLocaleDateString("en-IN") : "—"}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-700">Result Declared:</span>
            <span className="text-red-600 font-bold">
              {result.resultDate ? new Date(result.resultDate).toLocaleDateString("en-IN") : "—"}
            </span>
          </div>
        </div>
      </section>

      {/* HOW TO CHECK */}
      {result.howToCheck && (
        <section className="mb-8 border rounded-lg p-5 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-3 border-b pb-2">How to Check Result</h2>
          <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: decodeHtml(result.howToCheck) }} />
        </section>
      )}

      {/* IMPORTANT LINKS (SEO OPTIMIZED) */}
      <section className="mb-10 border-2 border-indigo-100 rounded-lg overflow-hidden shadow-md">
        <h2 className="text-xl md:text-2xl font-bold text-center text-indigo-800 bg-indigo-50 py-3 border-b border-indigo-100">
          Important Links
        </h2>
        <table className="w-full text-sm md:text-base">
          <tbody>
            {/* Map over Multiple Result Download Links Safely */}
            {result.importantLinks?.downloadResult?.map((link, index) => (
              <tr className="border-b" key={`download-${index}`}>
                <td className="p-4 font-bold text-pink-700 w-1/2 md:w-2/3">
                  {link.label || 'Download Result'}
                </td>
                <td className="p-4 text-center border-l bg-gray-50 hover:bg-blue-50 transition">
                  {link.url ? (
                    <a 
                      href={link.url.startsWith("http") ? link.url : `https://${link.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-700 font-extrabold text-lg hover:underline block w-full h-full"
                    >
                      Click Here
                    </a>
                  ) : (
                    <span className="text-gray-400">Link Unavailable</span>
                  )}
                </td>
              </tr>
            ))}

            {/* Official Website */}
            {result.importantLinks?.officialWebsite && (
              <tr>
                <td className="p-4 font-bold text-pink-700">Official Website</td>
                <td className="p-4 text-center border-l bg-gray-50 hover:bg-blue-50 transition">
                  <a 
                    href={result.importantLinks.officialWebsite.startsWith("http") ? result.importantLinks.officialWebsite : `https://${result.importantLinks.officialWebsite}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-700 font-extrabold text-lg hover:underline block w-full h-full"
                  >
                    Click Here
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="mt-8 text-center">
        <Link href="/result" className="text-indigo-600 text-lg font-semibold hover:underline">
          ← Back to All Results
        </Link>
      </div>
    </main>
  );
}