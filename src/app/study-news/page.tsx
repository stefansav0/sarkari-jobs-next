// src/app/study-news/page.tsx

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface NewsItem {
    _id: string;
    title: string;
    slug: string;
    coverImage?: string;
    excerpt: string;
}

export default async function StudyNewsList() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.finderight.com";

    const res = await fetch(`${baseUrl}/api/study-news`, {
        cache: "no-store",
    });

    if (!res.ok) {
        return (
            <div className="text-center py-10 text-red-600 font-semibold">
                Failed to load study news.
            </div>
        );
    }

    const data = await res.json();
    const news: NewsItem[] = Array.isArray(data.newsList) ? data.newsList : [];

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold text-blue-800 mb-8 border-b-2 border-blue-600 pb-2">
                📚 Study News
            </h1>

            <div className="grid md:grid-cols-2 gap-6">
                {news.map((item: NewsItem) => (
                    <Link
                        key={item._id}
                        href={`/study-news/${item.slug}`}
                        className="bg-white rounded-xl shadow hover:shadow-lg transition duration-300 border border-gray-200 overflow-hidden flex flex-col"
                    >
                        {item.coverImage && (
                            <div className="relative w-full h-52">
                                <Image
                                    src={item.coverImage}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority={false}
                                />
                            </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                            <h2 className="text-xl font-semibold text-blue-700 hover:underline line-clamp-2">
                                {item.title}
                            </h2>

                            <p className="text-gray-700 mt-3 line-clamp-3">{item.excerpt}</p>

                            <div className="mt-auto pt-4 text-blue-600 text-sm font-medium hover:underline">
                                Read more →
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
