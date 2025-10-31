"use client";

import { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";
import Link from "next/link";

// Define Job interface
interface Job {
    _id: string;
    title: string;
    department?: string;
    category?: string;
    slug?: string; // optional slug field if backend provides it
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

    return (
        <section className="mt-14">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                🆕 Latest Jobs
            </h2>

            {loading ? (
                <p className="text-center text-gray-500 animate-pulse">Loading jobs...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : jobListings.length ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobListings.slice(0, visibleCount).map((job, index) => {
                            // Generate a slug if not provided
                            const jobSlug =
                                job.slug ||
                                job.title
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/(^-|-$)/g, "");

                            return (
                                <Link
                                    key={job._id}
                                    href={`/jobs/slug/${jobSlug}`}
                                    className={`block p-5 rounded-xl text-white shadow-md transition-transform hover:scale-[1.02] duration-200 ${colors[index % colors.length]}`}
                                >
                                    <div className="flex items-center gap-2 text-lg font-semibold">
                                        <Briefcase className="w-5 h-5" />
                                        {job.title}
                                    </div>
                                    <p className="mt-1 text-sm font-light text-white/90">
                                        {job.department || job.category || "General"}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>

                    {visibleCount < jobListings.length && (
                        <div className="text-center mt-10">
                            <button
                                onClick={handleShowMore}
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
                            → View All Jobs
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
