// src/app/study-news/page.tsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

/* =========================================
   SEO METADATA
========================================= */
export const metadata: Metadata = {
  title:
    "Study News 2026 - Latest Education News, Exams & Recruitment Updates",

  description:
    "Get the latest study news, exam updates, recruitment notifications, board announcements, university alerts, admit cards, and education news across India.",

  keywords: [
    "study news",
    "education news",
    "exam updates",
    "government exam",
    "board exam",
    "recruitment news",
    "university news",
    "latest education updates",
    "student news",
    "competitive exams",
  ],

  openGraph: {
    title:
      "Study News 2026 - Latest Education Updates",

    description:
      "Latest education news, exam notifications, recruitment updates, admit cards, results, and academic announcements.",

    url: "https://www.finderight.com/study-news",

    siteName: "Finderight",

    images: [
      {
        url: "/default-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Study News",
      },
    ],

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Study News 2026 - Latest Education Updates",

    description:
      "Read the latest study news, recruitment alerts, and exam announcements.",

    images: ["/default-cover.jpg"],
  },
};

/* =========================================
   TYPES
========================================= */
interface NewsItem {
  _id?: string;

  title: string;

  slug: string;

  description?: string;

  excerpt?: string;

  coverImage?: string;

  imageUrl?: string;

  author?: string;

  createdAt?: string;

  publishDate?: string;

  visibility?: string;

  metaDescription?: string;
}

/* =========================================
   HELPERS
========================================= */

// Decode HTML entities
function unescapeHTML(str: string): string {
  if (!str) return "";

  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'");
}

// Strip HTML
function stripHtml(html?: string): string {
  if (!html) return "";

  const unescaped =
    unescapeHTML(html);

  return unescaped
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract array safely
function extractArray(
  input: unknown
): NewsItem[] {
  if (Array.isArray(input)) {
    return input as NewsItem[];
  }

  if (
    input &&
    typeof input === "object"
  ) {
    const record =
      input as Record<
        string,
        unknown
      >;

    for (const key in record) {
      const found = extractArray(
        record[key]
      );

      if (found.length)
        return found;
    }
  }

  return [];
}

/* =========================================
   PAGE
========================================= */
export default async function StudyNewsList() {
  const baseUrl =
    process.env
      .NEXT_PUBLIC_API_BASE_URL ||
    "https://www.finderight.com";

  /* =========================================
     FETCH NEWS
  ========================================= */
  const res = await fetch(
    `${baseUrl}/api/study-news?page=1&limit=9&visibility=published`,
    {
      next: {
        revalidate: 60,
      },
    }
  );

  /* =========================================
     ERROR UI
  ========================================= */
  if (!res.ok) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Failed to load study news
          </h2>

          <p className="mt-2 text-gray-600">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const data: unknown =
    await res.json();

  const news: NewsItem[] =
    extractArray(data);

  /* =========================================
     EMPTY STATE
  ========================================= */
  if (news.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            No Study News Available
          </h2>

          <p className="mt-2 text-gray-600">
            Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">

      {/* =========================================
         PAGE HEADER
      ========================================= */}
      <header className="mb-12">
        <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          Latest Education Updates
        </span>

        <h1 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Study News
        </h1>

        <p className="mt-4 text-lg text-gray-600 max-w-3xl leading-relaxed">
          Stay updated with the latest education news, recruitment alerts,
          government exam notifications, admit cards, university announcements,
          results, and academic developments across India.
        </p>

        <div className="mt-5 h-1 w-24 bg-blue-600 rounded-full" />
      </header>

      {/* =========================================
         NEWS GRID
      ========================================= */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => {
          // Clean description
          const cleanText =
            item.metaDescription ||
            stripHtml(item.excerpt) ||
            stripHtml(
              item.description
            ) ||
            "Read full article for complete details and official updates.";

          const image =
            item.coverImage ||
            item.imageUrl ||
            "/default-cover.jpg";

          return (
            <Link
              key={
                item._id ||
                item.slug
              }
              href={`/study-news/${item.slug}`}
              className="
                group
                bg-white
                rounded-2xl
                border
                border-gray-200
                overflow-hidden
                shadow-sm
                hover:shadow-2xl
                transition-all
                duration-300
                flex
                flex-col
              "
            >

              {/* IMAGE */}
              <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                <Image
                  src={image}
                  alt={item.title}
                  fill
                  priority={false}
                  className="
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-105
                  "
                  sizes="
                    (max-width: 768px) 100vw,
                    (max-width: 1200px) 50vw,
                    33vw
                  "
                />
              </div>

              {/* CONTENT */}
              <div className="p-5 flex flex-col flex-1">

                {/* AUTHOR + DATE */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>
                    ✍️ {item.author || "Admin"}
                  </span>

                  <span>
                    {item.createdAt &&
                      new Date(
                        item.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                  </span>
                </div>

                {/* TITLE */}
                <h2 className="
                  text-xl
                  font-semibold
                  text-gray-900
                  leading-snug
                  line-clamp-2
                  group-hover:text-blue-700
                  transition-colors
                ">
                  {item.title}
                </h2>

                {/* DESCRIPTION */}
                <p className="
                  mt-3
                  text-sm
                  text-gray-700
                  leading-relaxed
                  line-clamp-3
                ">
                  {cleanText}
                </p>

                {/* BUTTON */}
                <div className="mt-auto pt-5">
                  <span className="
                    inline-flex
                    items-center
                    text-blue-600
                    font-medium
                    text-sm
                    group-hover:gap-2
                    transition-all
                  ">
                    Read Full Article →
                  </span>
                </div>

              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}