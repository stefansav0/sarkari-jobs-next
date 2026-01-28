// src/app/study-news/page.tsx

import React from "react";
import Link from "next/link";
import Image from "next/image";

/* --------------------------------
   Types
-------------------------------- */
interface NewsItem {
  _id?: string;
  title: string;
  slug: string;
  coverImage?: string;
  excerpt?: string;
  description?: string;
  createdAt?: string;
}

/* --------------------------------
   Helper: strip HTML safely
-------------------------------- */
function stripHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* --------------------------------
   Helper: extract array safely
-------------------------------- */
function extractArray(input: unknown): NewsItem[] {
  if (Array.isArray(input)) {
    return input as NewsItem[];
  }

  if (input && typeof input === "object") {
    const record = input as Record<string, unknown>;
    for (const key in record) {
      const found = extractArray(record[key]);
      if (found.length) return found;
    }
  }

  return [];
}

/* --------------------------------
   Page
-------------------------------- */
export default async function StudyNewsList() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.finderight.com";

  const res = await fetch(`${baseUrl}/api/study-news?page=1&limit=20`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="text-center py-16 text-red-600 font-semibold">
        Failed to load study news.
      </div>
    );
  }

  const data: unknown = await res.json();
  const news: NewsItem[] = extractArray(data);

  if (news.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        No study news available at the moment.
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* ---------- PAGE HEADER ---------- */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Study News
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl">
          Latest education news, recruitment notifications, exam updates,
          university announcements, and important academic developments across
          India.
        </p>
        <div className="mt-4 h-1 w-24 bg-blue-600 rounded" />
      </header>

      {/* ---------- NEWS GRID ---------- */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => {
          const cleanText =
            stripHtml(item.excerpt) ||
            stripHtml(item.description) ||
            "Read the full article for detailed information and official updates.";

          return (
            <Link
              key={item._id || item.slug}
              href={`/study-news/${item.slug}`}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full h-52 bg-gray-100 overflow-hidden">
                <Image
                  src={item.coverImage || "/default-cover.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-lg font-semibold text-gray-900 leading-snug group-hover:text-blue-700 line-clamp-2">
                  {item.title}
                </h2>

                <p className="mt-3 text-sm text-gray-700 leading-relaxed line-clamp-3">
                  {cleanText}
                </p>

                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-blue-600 text-sm font-medium group-hover:underline">
                    Read full story →
                  </span>

                  {item.createdAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
