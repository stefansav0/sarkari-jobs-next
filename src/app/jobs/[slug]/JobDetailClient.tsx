"use client";

import Head from "next/head";
import Link from "next/link";

/* ------------ TYPES ------------ */
interface ImportantDates {
    applicationBegin?: string;
    lastDateApply?: string;
    lastDateFee?: string;
    examDate?: string;
    admitCard?: string;
}

interface ImportantLinks {
    applyOnline?: string;
    downloadNotification?: string;
    officialWebsite?: string;
}

export interface JobType {
    slug: string;
    title: string;
    department?: string;
    eligibility?: string;       // Supports HTML
    ageLimit?: string;          // Updated to support HTML
    lastDate?: string;
    applicationFee?: string;    // HTML string
    vacancy?: string;           // HTML string
    description?: string;
    importantDates?: ImportantDates;
    importantLinks?: ImportantLinks;
    createdAt?: string;
    updatedAt?: string;
}

interface JobDetailClientProps {
    job: JobType | null;
}

/* -------- HTML DECODE -------- */
function decodeHtml(html?: string): string {
    if (!html) return "";
    return html
        .replace(/\\u003C/g, "<")
        .replace(/\\u003E/g, ">")
        .replace(/\\u002F/g, "/");
}

/* -------- DATE FORMATTERS -------- */
function formatDateTime(value?: string): string {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDateOnly(value?: string): string {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
    if (!job) {
        return (
            <div className="text-center text-red-600 text-xl mt-10 font-semibold">
                ❌ Job not found.
            </div>
        );
    }

    const canonicalUrl = `https://finderight.com/jobs/${job.slug}`;
    const lastUpdated = job.updatedAt || job.createdAt;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.description,
        datePosted: job.importantDates?.applicationBegin || job.createdAt,
        validThrough: job.lastDate || undefined,
        hiringOrganization: {
            "@type": "Organization",
            name: job.department || "Finderight",
            sameAs: "https://finderight.com",
        },
        employmentType: "FULL_TIME",
        jobLocation: {
            "@type": "Place",
            address: { "@type": "PostalAddress", addressCountry: "IN" },
        },
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl bg-white shadow-xl rounded-xl my-10">
            <Head>
                <title>{job.title} | Finderight</title>
                <meta name="description" content={job.description?.slice(0, 160) || `Details for ${job.title}.`} />
                <link rel="canonical" href={canonicalUrl} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            </Head>

            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-4">{job.title}</h1>
            {job.department && <p className="text-center text-lg text-indigo-700 font-semibold mb-6">{job.department}</p>}

            {/* TOP INFO TABLE */}
            <section className="mb-8 border rounded-lg overflow-hidden">
                <table className="w-full text-sm md:text-base">
                    <tbody>
                        <tr className="border-b">
                            <td className="w-1/4 font-bold text-red-600 p-3">Name of Post:</td>
                            <td className="p-3 text-blue-700 font-semibold">{job.title}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="font-bold text-red-600 p-3">Last Updated:</td>
                            <td className="p-3">{formatDateTime(lastUpdated)}</td>
                        </tr>
                        <tr>
                            <td className="font-bold text-red-600 p-3">Short Info:</td>
                            <td className="p-3 leading-relaxed">{job.description || "See details below."}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* DATES & FEE SECTION */}
            <section className="mb-8 border rounded-lg overflow-hidden">
                <table className="w-full text-sm md:text-base">
                    <thead>
                        <tr className="bg-gray-100 text-green-700 font-bold text-center">
                            <th className="w-1/2 p-3 border-r">Important Dates</th>
                            <th className="w-1/2 p-3">Application Fee</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="align-top p-3 border-r">
                                <ul className="list-disc ml-5 space-y-1">
                                    {job.importantDates?.applicationBegin && <li>Begin: <b>{job.importantDates.applicationBegin}</b></li>}
                                    {job.importantDates?.lastDateApply && <li>Last Date: <b>{formatDateOnly(job.importantDates.lastDateApply)}</b></li>}
                                    {job.importantDates?.lastDateFee && <li>Fee Last Date: <b>{formatDateOnly(job.importantDates.lastDateFee)}</b></li>}
                                    {job.importantDates?.examDate && <li>Exam: <b>{job.importantDates.examDate}</b></li>}
                                    {job.importantDates?.admitCard && <li>Admit Card: <b>{job.importantDates.admitCard}</b></li>}
                                </ul>
                            </td>
                            <td className="align-top p-3">
                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: decodeHtml(job.applicationFee) }} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* AGE LIMIT (Now Rendering HTML) */}
            {job.ageLimit && (
                <section className="mb-8 border rounded-lg p-4">
                    <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-2">Age Limit</h2>
                    <div 
                        className="leading-relaxed prose prose-sm max-w-none" 
                        dangerouslySetInnerHTML={{ __html: decodeHtml(job.ageLimit) }} 
                    />
                </section>
            )}

            {/* VACANCY DETAILS */}
            {job.vacancy && (
                <section className="mb-8 border rounded-lg p-4">
                    <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-3">Vacancy Details</h2>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: decodeHtml(job.vacancy) }} />
                </section>
            )}

            {/* ELIGIBILITY (Now Rendering HTML) */}
            {job.eligibility && (
                <section className="mb-8 border rounded-lg p-4">
                    <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-2">Eligibility Criteria</h2>
                    <div 
                        className="leading-relaxed prose prose-sm max-w-none" 
                        dangerouslySetInnerHTML={{ __html: decodeHtml(job.eligibility) }} 
                    />
                </section>
            )}

            {/* IMPORTANT LINKS */}
            <section className="mb-10 border rounded-lg overflow-hidden">
                <h2 className="text-xl md:text-2xl font-bold text-center text-pink-700 py-3 border-b">Important Links</h2>
                <table className="w-full text-sm md:text-base">
                    <tbody>
                        {job.importantLinks?.applyOnline && (
                            <tr className="border-b">
                                <td className="p-3 font-bold text-pink-700">Apply Online</td>
                                <td className="p-3 text-right">
                                    <a href={job.importantLinks.applyOnline} target="_blank" className="text-blue-700 font-semibold underline">Click Here</a>
                                </td>
                            </tr>
                        )}
                        {job.importantLinks?.downloadNotification && (
                            <tr className="border-b">
                                <td className="p-3 font-bold text-pink-700">Download Notification</td>
                                <td className="p-3 text-right">
                                    <a href={job.importantLinks.downloadNotification} target="_blank" className="text-blue-700 font-semibold underline">Click Here</a>
                                </td>
                            </tr>
                        )}
                        {job.importantLinks?.officialWebsite && (
                            <tr>
                                <td className="p-3 font-bold text-pink-700">Official Website</td>
                                <td className="p-3 text-right">
                                    <a href={job.importantLinks.officialWebsite} target="_blank" className="text-blue-700 font-semibold underline">Click Here</a>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            <div className="text-center mt-10">
                <Link href="/jobs" className="text-indigo-600 text-lg font-semibold hover:underline">← Back to All Jobs</Link>
            </div>
        </div>
    );
}