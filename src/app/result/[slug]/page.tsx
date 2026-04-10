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
              text: result.howToCheck.replace(/<[^>]*>?/gm, ''), 
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
      <div className="flex flex-col justify-center items-center mt-20 min-h-[50vh] px-4">
        <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center max-w-md w-full shadow-sm">
          <h1 className="text-3xl font-bold text-red-600 mb-3">Result Not Found</h1>
          <p className="text-gray-600 mb-6">This result may have been removed or the URL is incorrect.</p>
          <Link href="/result" className="inline-block bg-red-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-red-700 transition">
            ← Browse All Results
          </Link>
        </div>
      </div>
    );
  }

  // Helper to safely format dates (since examDate might be plain text like "TBA")
  const renderDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-10 max-w-4xl bg-white shadow-2xl rounded-2xl my-8 md:my-12 border border-gray-100">
      {JsonLdSchemas(result)}

      {/* HEADER SECTION */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
          {result.title}
        </h1>
        {result.conductedBy && (
          <div className="inline-block bg-blue-50 border border-blue-100 rounded-full px-6 py-2">
            <p className="text-blue-800 font-semibold text-sm md:text-base">
              Conducted By: <span className="font-bold">{result.conductedBy}</span>
            </p>
          </div>
        )}
      </div>

      {/* SHORT INFO SECTION */}
      {result.shortInfo && (
        <div className="mb-10 bg-gradient-to-br from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-5 rounded-r-lg shadow-sm">
          <h3 className="font-bold text-indigo-900 mb-2 text-lg">📌 Brief Information</h3>
          <div className="text-gray-700 text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: decodeHtml(result.shortInfo) }} />
        </div>
      )}

      {/* INFO & DATES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        
        {/* POST DETAILS CARD */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
          <h2 className="text-lg font-bold text-white bg-gray-800 py-3 px-5">Result Details</h2>
          <div className="p-0">
            <table className="w-full text-sm md:text-base text-left">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="w-1/3 font-semibold text-gray-600 p-4 bg-gray-50">Post Name:</td>
                  <td className="p-4 text-gray-900 font-medium">{result.title}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-gray-600 p-4 bg-gray-50">Post Date:</td>
                  <td className="p-4 text-gray-900 font-medium">
                    {renderDate(result.postDate)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* TIMELINE DATES CARD */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
          <h2 className="text-lg font-bold text-white bg-green-600 py-3 px-5">Important Dates</h2>
          <div className="p-0">
            <table className="w-full text-sm md:text-base text-left">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="w-1/3 font-semibold text-gray-600 p-4 bg-green-50/50">Exam Date:</td>
                  <td className="p-4 text-gray-900 font-medium">
                    {/* ✅ Fixed: Will just render "TBA" if it's text, or format it if it's a date */}
                    {renderDate(result.examDate)}
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold text-gray-600 p-4 bg-green-50/50">Result Declared:</td>
                  <td className="p-4 text-red-600 font-bold">
                    {renderDate(result.resultDate)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* HOW TO CHECK */}
      {result.howToCheck && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-blue-600">📖</span> How to Check Result
          </h2>
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm prose prose-blue max-w-none text-gray-700 leading-relaxed" 
               dangerouslySetInnerHTML={{ __html: decodeHtml(result.howToCheck) }} 
          />
        </section>
      )}

      {/* IMPORTANT LINKS (PREMIUM UI) */}
      <section className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-indigo-100">
        <h2 className="text-xl md:text-2xl font-extrabold text-center text-white bg-gradient-to-r from-indigo-600 to-blue-600 py-4 uppercase tracking-wide">
          Important Links
        </h2>
        <div className="bg-white">
          <table className="w-full text-sm md:text-base border-collapse">
            <tbody>
              {/* Map over Multiple Result Download Links */}
              {result.importantLinks?.downloadResult?.map((link, index) => (
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition duration-150" key={`download-${index}`}>
                  <td className="p-5 font-bold text-indigo-900 w-1/2 md:w-2/3 align-middle">
                    {link.label || 'Download Result'}
                  </td>
                  <td className="p-4 text-center align-middle">
                    {link.url ? (
                      <a 
                        href={link.url.startsWith("http") ? link.url : `https://${link.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm md:text-base font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
                      >
                        Click Here
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center px-6 py-2.5 text-sm md:text-base font-medium rounded-full text-gray-500 bg-gray-200 cursor-not-allowed">
                        Link Unavailable
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Official Website */}
              {result.importantLinks?.officialWebsite && (
                <tr className="hover:bg-gray-50 transition duration-150">
                  <td className="p-5 font-bold text-indigo-900 w-1/2 md:w-2/3 align-middle">
                    Official Website
                  </td>
                  <td className="p-4 text-center align-middle">
                    <a 
                      href={result.importantLinks.officialWebsite.startsWith("http") ? result.importantLinks.officialWebsite : `https://${result.importantLinks.officialWebsite}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center justify-center px-6 py-2.5 border border-indigo-600 text-sm md:text-base font-bold rounded-full text-indigo-600 bg-transparent hover:bg-indigo-50 hover:shadow-sm transform hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
                    >
                      Click Here
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* BACK BUTTON */}
      <div className="mt-12 text-center pb-4">
        <Link href="/result" className="inline-flex items-center justify-center text-gray-600 hover:text-indigo-600 font-semibold transition group">
          <span className="transform group-hover:-translate-x-1 transition duration-200 mr-2">←</span> 
          Back to All Results
        </Link>
      </div>
    </main>
  );
}