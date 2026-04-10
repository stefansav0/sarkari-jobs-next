import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";

/* --------------------------------------
   Types
--------------------------------------- */
interface ImportantLinks {
  // ✅ Updated to match the new multiple-link array structure
  downloadAdmitCard?: { label: string; url: string }[];
  officialWebsite?: string;
}

interface AdmitCard {
  slug: string;
  title: string;
  conductedby?: string;
  applicationBegin?: string;
  lastDateApply?: string;
  admitCard?: string;
  examDate?: string;
  publishDate?: string;
  description?: string;
  howToDownload?: string;
  importantLinks?: ImportantLinks;
}

// Safe HTML Decoder for the text fields
function decodeHtml(html?: string) {
  if (!html) return "";
  return html.replace(/\\u003C/g, "<").replace(/\\u003E/g, ">").replace(/\\u002F/g, "/");
}

/* --------------------------------------
   Fetch Single Admit Card (NO CACHE)
--------------------------------------- */
async function getAdmitCard(slug: string): Promise<AdmitCard | null> {
  const headersList = await headers();
  const host = headersList.get("host");

  if (!host) return null;

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/admit-cards/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    
    // ✅ Extract the 'admitCard' object from the API response wrapper
    return data.admitCard || data;
  } catch (error) {
    console.error("Error fetching admit card:", error);
    return null;
  }
}

/* --------------------------------------
   Advanced SEO Metadata
--------------------------------------- */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admitCard = await getAdmitCard(slug);

  if (!admitCard) {
    return {
      title: "Admit Card Not Found | Finderight",
      description: "Requested admit card could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const url = `https://finderight.com/admit-card/${admitCard.slug}`;
  const ogImage = "https://finderight.com/og-default.png";
  
  // Strip HTML tags for clean meta descriptions
  const cleanDescription = admitCard.description?.replace(/<[^>]*>?/gm, '') || `Download the latest admit card for ${admitCard.title}. Check exam date, release date & official links.`;

  return {
    title: `${admitCard.title} | Download Admit Card`,
    description: cleanDescription.substring(0, 160),
    alternates: { canonical: url },
    openGraph: {
      title: admitCard.title,
      description: cleanDescription.substring(0, 160),
      type: "article",
      url,
      siteName: "Finderight",
      publishedTime: admitCard.publishDate,
      modifiedTime: admitCard.publishDate,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: admitCard.title,
      description: cleanDescription.substring(0, 160),
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

/* --------------------------------------
   JSON-LD Schema
--------------------------------------- */
function AdmitCardJsonLd(item: AdmitCard) {
  const url = `https://finderight.com/admit-card/${item.slug}`;
  const cleanDescription = item.description?.replace(/<[^>]*>?/gm, '') || `Download admit card for ${item.title}.`;

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
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://finderight.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Admit Cards",
        item: "https://finderight.com/admit-card",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: url,
      },
    ],
  };

  const faqSchema = item.howToDownload
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How to download the admit card?",
            acceptedAnswer: {
              "@type": "Answer",
              text: item.howToDownload.replace(/<[^>]*>?/gm, ''), // Strip HTML for schema
            },
          },
        ],
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
    </>
  );
}

/* --------------------------------------
   PAGE COMPONENT (Server Rendered)
--------------------------------------- */
export default async function AdmitCardDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admitCard = await getAdmitCard(slug);

  if (!admitCard) {
    return (
      <div className="flex flex-col justify-center items-center mt-20 min-h-[50vh] px-4">
        <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center max-w-md w-full shadow-sm">
          <h1 className="text-3xl font-bold text-red-600 mb-3">Admit Card Not Found</h1>
          <p className="text-gray-600 mb-6">This admit card may have been removed or the URL is incorrect.</p>
          <Link href="/admit-card" className="inline-block bg-red-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-red-700 transition">
            ← Browse All Admit Cards
          </Link>
        </div>
      </div>
    );
  }

  // Helper to safely format dates (since dates might be plain text like "TBA")
  const renderDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Backward compatibility check for older data where downloadAdmitCard might still be a string
  const downloadLinks = Array.isArray(admitCard.importantLinks?.downloadAdmitCard) 
      ? admitCard.importantLinks?.downloadAdmitCard 
      : typeof admitCard.importantLinks?.downloadAdmitCard === 'string' && admitCard.importantLinks?.downloadAdmitCard
          ? [{ label: "Download Admit Card", url: admitCard.importantLinks.downloadAdmitCard }]
          : [];

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-10 max-w-4xl bg-white shadow-2xl rounded-2xl my-8 md:my-12 border border-gray-100">
      {AdmitCardJsonLd(admitCard)}

      {/* HEADER SECTION */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
          {admitCard.title}
        </h1>
        {admitCard.conductedby && (
          <div className="inline-block bg-blue-50 border border-blue-100 rounded-full px-6 py-2">
            <p className="text-blue-800 font-semibold text-sm md:text-base">
              Conducted By: <span className="font-bold">{admitCard.conductedby}</span>
            </p>
          </div>
        )}
      </div>

      {/* DESCRIPTION SECTION */}
      {admitCard.description && (
        <div className="mb-10 bg-gradient-to-br from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-5 rounded-r-lg shadow-sm">
          <h3 className="font-bold text-indigo-900 mb-2 text-lg">📌 Brief Information</h3>
          <div className="text-gray-700 text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: decodeHtml(admitCard.description) }} />
        </div>
      )}

      {/* INFO & DATES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        
        {/* POST DETAILS CARD */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
          <h2 className="text-lg font-bold text-white bg-gray-800 py-3 px-5">Admit Card Details</h2>
          <div className="p-0">
            <table className="w-full text-sm md:text-base text-left">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="w-1/3 font-semibold text-gray-600 p-4 bg-gray-50">Post Name:</td>
                  <td className="p-4 text-gray-900 font-medium">{admitCard.title}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-gray-600 p-4 bg-gray-50">Published On:</td>
                  <td className="p-4 text-gray-900 font-medium">
                    {renderDate(admitCard.publishDate)}
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
                  <td className="w-1/2 font-semibold text-gray-600 p-3 bg-green-50/50">Application Begin:</td>
                  <td className="p-3 text-gray-900 font-medium">{renderDate(admitCard.applicationBegin)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="font-semibold text-gray-600 p-3 bg-green-50/50">Last Date to Apply:</td>
                  <td className="p-3 text-gray-900 font-medium">{renderDate(admitCard.lastDateApply)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="font-semibold text-gray-600 p-3 bg-green-50/50">Exam Date:</td>
                  <td className="p-3 text-gray-900 font-medium">{renderDate(admitCard.examDate)}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-gray-600 p-3 bg-green-50/50">Admit Card Release:</td>
                  <td className="p-3 text-red-600 font-bold">{renderDate(admitCard.admitCard)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* HOW TO DOWNLOAD */}
      {admitCard.howToDownload && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-blue-600">📖</span> How to Download Admit Card
          </h2>
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm prose prose-blue max-w-none text-gray-700 leading-relaxed" 
               dangerouslySetInnerHTML={{ __html: decodeHtml(admitCard.howToDownload) }} 
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
              {/* Map over Multiple Download Links */}
              {downloadLinks.map((link, index) => (
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition duration-150" key={`download-${index}`}>
                  <td className="p-5 font-bold text-indigo-900 w-1/2 md:w-2/3 align-middle">
                    {link.label || 'Download Admit Card'}
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
              {admitCard.importantLinks?.officialWebsite && (
                <tr className="hover:bg-gray-50 transition duration-150">
                  <td className="p-5 font-bold text-indigo-900 w-1/2 md:w-2/3 align-middle">
                    Official Website
                  </td>
                  <td className="p-4 text-center align-middle">
                    <a 
                      href={admitCard.importantLinks.officialWebsite.startsWith("http") ? admitCard.importantLinks.officialWebsite : `https://${admitCard.importantLinks.officialWebsite}`} 
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

      {/* FOOTER DISCLAIMER */}
      <div className="mt-12 text-center pb-4 border-t border-gray-200 pt-8">
        <p className="font-semibold text-lg mb-2 text-blue-600">Welcome to Finderight!</p>
        <p className="text-gray-600 mb-6 text-sm">
          Get information about Jobs, Admissions, Results, Admit Cards, Answer Keys and News. Bookmark our website and stay updated.
        </p>
        <p className="text-red-600 text-xs">
          <strong>Disclaimer:</strong> Please verify details with official notifications. We are not responsible for any errors.
        </p>
        <div className="mt-8">
          <Link href="/admit-card" className="inline-flex items-center justify-center text-gray-600 hover:text-indigo-600 font-semibold transition group">
            <span className="transform group-hover:-translate-x-1 transition duration-200 mr-2">←</span> 
            Back to All Admit Cards
          </Link>
        </div>
      </div>
    </main>
  );
}