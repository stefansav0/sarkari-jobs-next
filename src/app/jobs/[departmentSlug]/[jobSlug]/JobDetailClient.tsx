"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";

// --- Type Definitions (Kept the same) ---
interface Job {
    title: string;
    department?: string;
    eligibility?: string;
    ageLimit?: string;
    lastDate?: string;
    applicationFee?: string;
    vacancy?: string;
    description?: string;
    importantDates?: {
        applicationBegin?: string;
        lastDateApply?: string;
        lastDateFee?: string;
        examDate?: string;
        admitCard?: string;
    };
    importantLinks?: {
        applyOnline?: string;
        downloadNotification?: string;
        officialWebsite?: string;
    };
}

interface JobDetailClientProps {
    jobSlug: string;
}

const JobDetailClient = ({ jobSlug }: JobDetailClientProps) => {
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching Logic (Kept the same) ---
    useEffect(() => {
        const fetchJobDetail = async () => {
            try {
                const res = await fetch(`/api/jobs/${jobSlug}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch job details.");
                setJob(data.job);
            } catch {
                setError("Error loading job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetail();
    }, [jobSlug]);

    // --- Structured Data (Kept the same) ---
    const structuredData = job
        ? {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: job.description,
            datePosted: job.importantDates?.applicationBegin || new Date().toISOString(),
            validThrough: job.lastDate || new Date().toISOString(),
            hiringOrganization: {
                "@type": "Organization",
                name: job.department || "Finderight",
                sameAs: "https://finderight.com",
            },
            jobLocation: {
                "@type": "Place",
                address: {
                    "@type": "PostalAddress",
                    addressCountry: "IN",
                },
            },
            employmentType: "FULL_TIME",
        }
        : null;

    // --- Helper for Date Formatting ---
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString; // Return as is if parsing fails
        }
    };

    // --- Render Logic (Design Enhanced) ---
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl bg-white shadow-lg rounded-xl my-8">
            {/* SEO and Head Content */}
            {job && (
                <Head>
                    <title>{job.title} | Finderight</title>
                    <meta name="description" content={job.description?.slice(0, 160) || `Details for ${job.title} recruitment.`} />
                    <meta name="robots" content="index, follow" />
                    <link rel="canonical" href={`https://finderight.com/jobs/${jobSlug}`} />
                    <meta property="og:title" content={job.title} />
                    <meta property="og:description" content={job.description?.slice(0, 160) || `Details for ${job.title} recruitment.`} />
                    <meta property="og:type" content="article" />
                    {structuredData && (
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                        />
                    )}
                </Head>
            )}

            {/* Loading/Error States */}
            {loading && <p className="text-center py-12 text-xl text-gray-600">Loading job details...</p>}
            {error && <p className="text-center py-12 text-xl text-red-500 font-medium">{error}</p>}
            {!loading && !job && <p className="text-center py-12 text-xl text-red-500 font-medium">Job not found. The link may be invalid.</p>}

            {/* Job Details Content */}
            {job && (
                <>
                    {/* Header Section */}
                    <header className="mb-8 border-b pb-4">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center leading-snug">
                            {job.title}
                        </h1>
                        <p className="text-center text-lg text-indigo-600 mt-2 font-medium">
                            {job.department || "Recruitment Details"}
                        </p>
                    </header>

                    {/* Key Highlights Card */}
                    <div className="bg-indigo-50 p-5 rounded-lg border-l-4 border-indigo-500 mb-8 shadow-md">
                        <h2 className="text-xl font-bold text-indigo-700 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Key Highlights
                        </h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-gray-700">
                            {job.eligibility && (
                                <div className="flex justify-between sm:block">
                                    <dt className="font-semibold text-sm text-gray-600">Eligibility:</dt>
                                    <dd className="font-medium">{job.eligibility}</dd>
                                </div>
                            )}
                            {job.ageLimit && (
                                <div className="flex justify-between sm:block">
                                    <dt className="font-semibold text-sm text-gray-600">Age Limit:</dt>
                                    <dd className="font-medium">{job.ageLimit}</dd>
                                </div>
                            )}
                            {job.lastDate && (
                                <div className="flex justify-between sm:block">
                                    <dt className="font-semibold text-sm text-gray-600">Last Date to Apply:</dt>
                                    <dd className="font-medium text-red-600">
                                        {formatDate(job.lastDate)}
                                    </dd>
                                </div>
                            )}

                        </dl>
                    </div>

                    {/* Description and Fee/Vacancy Section */}
                    {job.description && (
                        <section className="mb-8 p-5 border rounded-lg shadow-sm">
                            <h2 className="text-2xl font-bold text-indigo-700 mb-3 border-b pb-2">Job Description / Short Info</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                        </section>
                    )}

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {job.applicationFee && (
                            <div className="border p-5 rounded-lg shadow-sm bg-gray-50">
                                <h2 className="text-xl font-bold text-indigo-700 mb-3 border-b pb-2">Application Fee Details</h2>
                                <div
                                    className="text-gray-700 prose max-w-none text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: job.applicationFee }}
                                />
                            </div>
                        )}
                        {job.vacancy && (
                            <div className="border p-5 rounded-lg shadow-sm bg-gray-50">
                                <h2 className="text-xl font-bold text-indigo-700 mb-3 border-b pb-2">Vacancy Details</h2>
                                <div
                                    className="text-gray-700 prose max-w-none text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: job.vacancy }}
                                />
                            </div>
                        )}
                    </section>

                    {/* Important Dates Table */}
                    {job.importantDates && (
                        <section className="mb-8 p-5 border rounded-lg shadow-sm bg-white">
                            <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b pb-2"> Important Dates</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 w-1/2">Application Begin</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-green-600 font-semibold">{formatDate(job.importantDates.applicationBegin)}</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">Last Date to Apply</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-red-600 font-semibold">{formatDate(job.importantDates.lastDateApply)}</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">Fee Payment Last Date</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(job.importantDates.lastDateFee)}</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">Exam Date</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-orange-600 font-semibold">{job.importantDates.examDate || "To be announced soon"}</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">Admit Card Availability</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{job.importantDates.admitCard || "Notified Soon"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Important Links (Call to Action) */}
                    {job.importantLinks && (
                        <section className="mb-8 p-5 border rounded-lg shadow-lg bg-indigo-50">
                            <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">🔗 Important Links & Downloads</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {job.importantLinks.applyOnline && (
                                    <a
                                        href={job.importantLinks.applyOnline}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-center transition duration-300 transform hover:scale-105 shadow-md"
                                    >
                                        Apply Online Here
                                    </a>
                                )}
                                {job.importantLinks.downloadNotification && (
                                    <a
                                        href={job.importantLinks.downloadNotification}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-center transition duration-300 transform hover:scale-105 shadow-md"
                                    >
                                        Download Official Notification
                                    </a>
                                )}
                                {job.importantLinks.officialWebsite && (
                                    <a
                                        href={job.importantLinks.officialWebsite}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-center transition duration-300 transform hover:scale-105 shadow-md"
                                    >
                                        Official Website
                                    </a>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Navigation and Footer */}
                    <div className="text-center mt-10">
                        <Link href="/jobs" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition duration-200">
                            &larr; Back to All Jobs
                        </Link>
                    </div>

                    <footer className="mt-12 pt-8 border-t border-gray-200 text-sm text-center">
                        <p className="font-extrabold text-xl mb-2 text-indigo-700">Finderight</p>
                        <p className="text-gray-600 mb-4 max-w-xl mx-auto">
                            Get verified and updated job alerts, results, admit cards, answer keys, and admission notices. **Bookmark us** for daily Sarkari job alerts.
                        </p>
                        <p className="text-red-700 text-xs mt-4 p-3 bg-red-50 rounded-lg max-w-md mx-auto border border-red-200">
                            **Disclaimer:** Information is for awareness purposes only. Always refer to official government/department websites** before applying or making any payment.
                        </p>
                    </footer>
                </>
            )}
        </div>
    );
};

export default JobDetailClient;