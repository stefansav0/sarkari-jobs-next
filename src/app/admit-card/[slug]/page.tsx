import { ExternalLink, CalendarDays } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Metadata } from "next";

/* ---------------------- Types ---------------------- */
interface ImportantLinks {
  applyOnline?: string;
  downloadAdmitCard?: string;
  officialWebsite?: string;
}

interface AdmitCard {
  title: string;
  slug: string;
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

/* ---------------------- Fetch Function ---------------------- */
async function getAdmitCard(slug: string): Promise<AdmitCard | null> {
  const headersList = await headers();
  const host = headersList.get("host");

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/admit-cards/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data && data.slug ? data : null;
}

/* ---------------------- Advanced SEO Metadata ---------------------- */
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
    };
  }

  const url = `https://finderight.com/admit-card/${admitCard.slug}`;
  const ogImage = "https://finderight.com/og-default.png";

  return {
    title: `${admitCard.title} | Download Admit Card`,
    description:
      admitCard.description ||
      `Download the latest admit card for ${admitCard.title}. Check exam date, release date & official links.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: admitCard.title,
      description:
        admitCard.description ||
        `Latest update for ${admitCard.title}. Download now.`,
      type: "article",
      url,
      siteName: "Finderight",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: admitCard.title,
      description:
        admitCard.description ||
        `Download admit card for ${admitCard.title} from official source.`,
      images: [ogImage],
    },
  };
}

/* ---------------------- JSON-LD Schema ---------------------- */
function AdmitCardJsonLd(item: AdmitCard) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description:
      item.description ||
      `Download admit card for ${item.title}. Check exam dates & official links.`,
    datePublished: item.publishDate || new Date().toISOString(),
    dateModified: item.publishDate || new Date().toISOString(),
    url: `https://finderight.com/admit-card/${item.slug}`,
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
        name: "Admit Cards",
        item: "https://finderight.com/admit-card",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: item.title,
        item: `https://finderight.com/admit-card/${item.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}

/* ---------------------- PAGE COMPONENT ---------------------- */
export default async function AdmitCardDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admitCard = await getAdmitCard(slug);

  if (!admitCard) {
    return (
      <div className="text-center text-red-500 mt-8">
        Admit Card not found or failed to load.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      {AdmitCardJsonLd(admitCard)}

      <h1 className="text-3xl font-bold text-blue-700 mb-2">
        {admitCard.title}
      </h1>

      {admitCard.conductedby && (
        <p className="text-gray-800 mb-4">
          <strong>Conducted By:</strong> {admitCard.conductedby}
        </p>
      )}

      {/* Dates */}
      <div className="space-y-1 text-gray-700 text-sm mb-6">
        {admitCard.applicationBegin && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Application Begin: {admitCard.applicationBegin}
          </p>
        )}

        {admitCard.lastDateApply && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Last Date to Apply: {admitCard.lastDateApply}
          </p>
        )}

        {admitCard.admitCard && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Admit Card Release: {admitCard.admitCard}
          </p>
        )}

        {admitCard.examDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Exam Date: {admitCard.examDate}
          </p>
        )}

        {admitCard.publishDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Published On:{" "}
            {new Date(admitCard.publishDate).toLocaleDateString("en-IN")}
          </p>
        )}
      </div>

      {/* Description */}
      {admitCard.description && (
        <section className="border p-4 rounded mb-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">
            Description
          </h2>
          <p>{admitCard.description}</p>
        </section>
      )}

      {/* How to Download */}
      {admitCard.howToDownload && (
        <section className="border p-4 rounded mb-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">
            How to Download
          </h2>
          <p>{admitCard.howToDownload}</p>
        </section>
      )}

      {/* Important Links */}
      {admitCard.importantLinks && (
        <section className="border p-4 rounded mb-4 bg-white">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">
            Important Links
          </h2>
          <ul className="space-y-2">
            {admitCard.importantLinks.applyOnline && (
              <li>
                <a
                  href={admitCard.importantLinks.applyOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Apply Online <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </li>
            )}

            {admitCard.importantLinks.downloadAdmitCard && (
              <li>
                <a
                  href={admitCard.importantLinks.downloadAdmitCard}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Download Admit Card{" "}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </li>
            )}

            {admitCard.importantLinks.officialWebsite && (
              <li>
                <a
                  href={admitCard.importantLinks.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Official Website{" "}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Back */}
      <div className="text-center mt-6">
        <Link
          href="/admit-card"
          className="text-blue-600 hover:underline font-medium"
        >
          ← Back to Admit Cards
        </Link>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center mt-8 text-sm text-gray-700">
        <p className="font-semibold text-lg mb-2 text-blue-600">
          Welcome to Finderight!
        </p>
        <p className="mb-4">
          Get information about Jobs, Admissions, Results, Admit Cards, Answer
          Keys and News. Bookmark our website and stay updated.
        </p>

        <hr className="my-4" />

        <p className="text-red-600 text-xs">
          <strong>Disclaimer:</strong> Please verify details with official
          notifications. We are not responsible for any errors.
        </p>
      </div>
    </main>
  );
}
