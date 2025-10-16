"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";

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

    useEffect(() => {
        const fetchJobDetail = async () => {
            try {
                const res = await fetch(`/api/jobs/slug/${jobSlug}`);
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

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            {job && (
                <Head>
                    <title>{job.title} | Finderight</title>
                    <meta name="description" content={job.description?.slice(0, 160)} />
                    <meta name="robots" content="index, follow" />
                    <link rel="canonical" href={`https://finderight.com/jobs/${jobSlug}`} />
                    <meta property="og:title" content={job.title} />
                    <meta property="og:description" content={job.description?.slice(0, 160)} />
                    <meta property="og:type" content="article" />
                    {structuredData && (
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                        />
                    )}
                </Head>
            )}

            {loading && <p className="text-center">Loading job details...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!loading && !job && <p className="text-center text-red-500">Job not found.</p>}

            {job && (
                <>
                    <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
                        {job.title}
                    </h1>

                    <article className="bg-gray-100 p-4 rounded mb-4">
                        {job.department && <p><strong>Department:</strong> {job.department}</p>}
                        {job.eligibility && <p><strong>Eligibility:</strong> {job.eligibility}</p>}
                        {job.ageLimit && <p><strong>Age Limit:</strong> {job.ageLimit}</p>}
                        {job.lastDate && <p><strong>Last Date:</strong> {new Date(job.lastDate).toLocaleDateString()}</p>}
                    </article>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {job.applicationFee && (
                            <div className="border p-3 rounded prose max-w-none">
                                <h2 className="text-lg font-semibold text-blue-500 mb-2">Application Fee</h2>
                                <div dangerouslySetInnerHTML={{ __html: job.applicationFee }} />
                            </div>
                        )}
                        {job.vacancy && (
                            <div className="border p-3 rounded prose max-w-none">
                                <h2 className="text-lg font-semibold text-blue-500 mb-2">Vacancy Details</h2>
                                <div dangerouslySetInnerHTML={{ __html: job.vacancy }} />
                            </div>
                        )}
                    </section>

                    {job.description && (
                        <section className="border p-3 rounded mb-4">
                            <h2 className="text-lg font-semibold mb-1 text-blue-500">Job Description</h2>
                            <p>{job.description}</p>
                        </section>
                    )}

                    {job.importantDates && (
                        <section className="border p-3 rounded mb-4">
                            <h2 className="text-lg font-semibold text-blue-500 mb-2">Important Dates</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Application Begin:</strong> {job.importantDates.applicationBegin || "N/A"}</li>
                                <li><strong>Last Date to Apply:</strong> {job.importantDates.lastDateApply || "N/A"}</li>
                                <li><strong>Fee Payment Last Date:</strong> {job.importantDates.lastDateFee || "N/A"}</li>
                                <li><strong>Exam Date:</strong> {job.importantDates.examDate || "To be announced"}</li>
                                <li><strong>Admit Card:</strong> {job.importantDates.admitCard || "Notified Soon"}</li>
                            </ul>
                        </section>
                    )}

                    {job.importantLinks && (
                        <section className="border p-3 rounded mb-4">
                            <h2 className="text-lg font-semibold text-blue-500 mb-2">Important Links</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                {job.importantLinks.applyOnline && (
                                    <li>
                                        <a href={job.importantLinks.applyOnline} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Apply Online
                                        </a>
                                    </li>
                                )}
                                {job.importantLinks.downloadNotification && (
                                    <li>
                                        <a href={job.importantLinks.downloadNotification} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Download Notification
                                        </a>
                                    </li>
                                )}
                                {job.importantLinks.officialWebsite && (
                                    <li>
                                        <a href={job.importantLinks.officialWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Official Website
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </section>
                    )}

                    <div className="text-center mt-6">
                        <Link href="/jobs" className="text-blue-600 hover:underline">
                            ← Back to Jobs
                        </Link>
                    </div>

                    <footer className="text-center mt-8 text-sm text-gray-700">
                        <p className="font-semibold text-lg mb-2 text-blue-600">Welcome to Finderight</p>
                        <p className="mb-4">
                            Get verified and updated job alerts, results, admit cards, answer keys, and admission notices. Bookmark us for daily Sarkari job alerts.
                        </p>
                        <hr className="my-4" />
                        <p className="text-red-600 text-xs">
                            <strong>Disclaimer:</strong> Information is for awareness purposes only. Always refer to official websites before applying.
                        </p>
                    </footer>
                </>
            )}
        </div>
    );
};

export default JobDetailClient;
