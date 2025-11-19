"use client";

import { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";
import Link from "next/link";

// Job type
interface Job {
    _id: string;
    title: string;
    department?: string;
    category?: string;
    slug?: string;
    datePosted?: string;
    location?: string;
}

// Gradient colors
const colors = [
    "bg-gradient-to-r from-blue-600 to-indigo-600",
    "bg-gradient-to-r from-pink-500 to-rose-500",
    "bg-gradient-to-r from-green-600 to-teal-500",
    "bg-gradient-to-r from-purple-600 to-fuchsia-500",
    "bg-gradient-to-r from-yellow-500 to-orange-500",
    "bg-gradient-to-r from-cyan-500 to-blue-500",
    "bg-gradient-to-r from-red-500 to-pink-600",
];

export default function LatestJobs() {
    const [jobListings, setJobListings] = useState<Job[]>([]);
    const [visibleCount, setVisibleCount] = useState(6);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/jobs/latest", { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to load jobs");

                const data = await res.json();
                if (data.success && Array.isArray(data.jobs)) {
                    setJobListings(data.jobs);
                } else {
                    throw new Error("Invalid response format");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("❌ Failed to load latest jobs.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const showMore = () => setVisibleCount((p) => p + 6);

    /* ------------------------
       JSON-LD for SEO
    ------------------------ */
    const jobSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: jobListings.slice(0, visibleCount).map((job, index) => {
            const jobSlug =
                job.slug ||
                job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

            return {
                "@type": "ListItem",
                position: index + 1,
                item: {
                    "@type": "JobPosting",
                    title: job.title,
                    description: `${job.title} recruitment in ${job.department || job.category}.`,
                    datePosted: job.datePosted || new Date().toISOString(),
                    employmentType: "FULL_TIME",
                    hiringOrganization: {
                        "@type": "Organization",
                        name: "Finderight",
                        sameAs: "https://finderight.com",
                    },
                    jobLocation: {
                        "@type": "Place",
                        address: { "@type": "PostalAddress", addressCountry: "IN" },
                    },
                    url: `https://finderight.com/jobs/${jobSlug}`,
                },
            };
        }),
    };

    return (
        <section className="mt-14 w-full" aria-labelledby="latest-jobs-heading">
            {/* JSON-LD Structured SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jobSchema),
                }}
            />

            <h2
                id="latest-jobs-heading"
                className="text-3xl font-bold text-center text-gray-900 mb-8"
            >
                Latest Jobs
            </h2>

            {loading && (
                <p className="text-center text-gray-500 animate-pulse">
                    Loading latest government jobs...
                </p>
            )}

            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && jobListings.length > 0 && (
                <>
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                        itemScope
                        itemType="https://schema.org/ItemList"
                    >
                        {jobListings.slice(0, visibleCount).map((job, index) => {
                            const jobSlug =
                                job.slug ||
                                job.title
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/(^-|-$)/g, "");

                            return (
                                <article
                                    key={job._id}
                                    itemScope
                                    itemType="https://schema.org/JobPosting"
                                    className={`group rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-[1.02] ${colors[index % colors.length]} text-white p-5`}
                                >
                                    <Link
                                        href={`/jobs/${jobSlug}`}
                                        itemProp="url"
                                        className="block"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <h3
                                                itemProp="title"
                                                className="text-lg font-semibold leading-snug line-clamp-2"
                                            >
                                                {job.title}
                                            </h3>
                                        </div>
                                        <p
                                            className="text-sm font-light text-white/90"
                                            itemProp="description"
                                        >
                                            {job.department || job.category || "Government Sector"}
                                        </p>
                                    </Link>
                                </article>
                            );
                        })}
                    </div>

                    {visibleCount < jobListings.length && (
                        <div className="text-center mt-10">
                            <button
                                onClick={showMore}
                                className="px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-lg"
                            >
                                Load More Jobs
                            </button>
                        </div>
                    )}

                    <div className="text-center mt-6">
                        <Link
                            href="/jobs"
                            className="text-indigo-600 hover:underline text-sm font-medium"
                        >
                            → View All Government Jobs
                        </Link>
                    </div>
                </>
            )}

            {!loading && !error && jobListings.length === 0 && (
                <p className="text-center text-gray-500">No jobs found.</p>
            )}
        </section>
    );
}
