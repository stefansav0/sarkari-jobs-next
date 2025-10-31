"use client";

import { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import Head from "next/head"; // ✅ Add SEO metadata

// Job interface
interface Job {
    _id: string;
    title: string;
    department?: string;
    category?: string;
    slug?: string;
    datePosted?: string;
    location?: string;
}

// Gradient color classes (cycled)
const colors: string[] = [
    "bg-gradient-to-r from-blue-600 to-indigo-600",
    "bg-gradient-to-r from-pink-500 to-rose-500",
    "bg-gradient-to-r from-green-600 to-teal-500",
    "bg-gradient-to-r from-purple-600 to-fuchsia-500",
    "bg-gradient-to-r from-yellow-500 to-orange-500",
    "bg-gradient-to-r from-cyan-500 to-blue-500",
    "bg-gradient-to-r from-red-500 to-pink-600",
];

const LatestJobs = () => {
    const [jobListings, setJobListings] = useState<Job[]>([]);
    const [visibleCount, setVisibleCount] = useState<number>(6);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getJobs = async () => {
            try {
                const res = await fetch("/api/jobs/latest");
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data: { success: boolean; jobs: Job[] } = await res.json();

                if (data.success && Array.isArray(data.jobs)) {
                    setJobListings(data.jobs);
                    setError(null);
                } else {
                    throw new Error("Invalid data format received from server.");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("❌ Something went wrong while fetching jobs.");
            } finally {
                setLoading(false);
            }
        };

        getJobs();
    }, []);

    const handleShowMore = () => setVisibleCount((prev) => prev + 6);

    // ✅ JSON-LD structured data for SEO
    const jobSchema = jobListings.slice(0, visibleCount).map((job) => ({
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        title: job.title,
        datePosted: job.datePosted || new Date().toISOString(),
        employmentType: "FULL_TIME",
        hiringOrganization: {
            "@type": "Organization",
            name: "Finderight",
            sameAs: "https://finderight.com",
        },
        jobLocation: {
            "@type": "Place",
            address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
            },
        },
        description: `${job.title} opening in ${job.department || job.category || "Government sector"} — Apply now.`,
        url: `https://finderight.com/jobs/slug/${job.slug || job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    }));

    return (
        <section className="mt-14 w-full" aria-labelledby="latest-jobs-heading">
            {/* ✅ SEO Metadata */}
            <Head>
                <title>Latest Government Jobs 2025 | Finderight</title>
                <meta
                    name="description"
                    content="Find the latest Sarkari Naukri updates, government jobs, and employment news for 2025. Stay ahead with Finderight — India's trusted job portal."
                />
                <meta
                    name="keywords"
                    content="Sarkari Job, Latest Govt Jobs, Government Recruitment, Sarkari Naukri 2025, Finderight Jobs, Govt Vacancy"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
                />
            </Head>

            <h2
                id="latest-jobs-heading"
                className="text-3xl font-bold text-center text-gray-900 mb-8"
            >
                Latest Jobs
            </h2>

            {loading ? (
                <p className="text-center text-gray-500 animate-pulse">Loading jobs...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : jobListings.length ? (
                <>
                    {/* ✅ Mobile-friendly and SEO-semantic grid */}
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
                                    className={`group block rounded-xl shadow-md hover:shadow-lg transition-transform duration-200 hover:scale-[1.02] ${colors[index % colors.length]} text-white p-4 sm:p-5`}
                                >
                                    <Link
                                        href={`/jobs/slug/${jobSlug}`}
                                        itemProp="url"
                                        className="block"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition">
                                                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <h3
                                                itemProp="title"
                                                className="text-base sm:text-lg font-semibold leading-snug line-clamp-2"
                                            >
                                                {job.title}
                                            </h3>
                                        </div>
                                        <p
                                            className="text-sm sm:text-base font-light text-white/90 mt-1"
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
                                onClick={handleShowMore}
                                className="px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-lg text-sm sm:text-base"
                                aria-label="Load more government job listings"
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
                            → View All Sarkari Jobs
                        </Link>
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-500">No jobs found.</p>
            )}
        </section>
    );
};

export default LatestJobs;
