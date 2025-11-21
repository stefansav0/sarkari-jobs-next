"use client";

import Head from "next/head";
import Link from "next/link";

/* ------------ TYPES (match your current DB) ------------ */
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
    eligibility?: string;
    ageLimit?: string;
    lastDate?: string;
    applicationFee?: string; // HTML string
    vacancy?: string;        // HTML string
    description?: string;
    importantDates?: ImportantDates;
    importantLinks?: ImportantLinks;
    createdAt?: string;
    updatedAt?: string;
}

/* Props */
interface JobDetailClientProps {
    job: JobType | null;
}

/* -------- HTML DECODE (for stored HTML strings) -------- */
function decodeHtml(html?: string): string {
    if (!html) return "";
    return html
        .replace(/\\u003C/g, "<")
        .replace(/\\u003E/g, ">")
        .replace(/\\u002F/g, "/");
}

/* -------- DATE FORMATTER -------- */
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

/* ---------------- COMPONENT ---------------- */
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
            {/* SEO Metadata */}
            <Head>
                <title>{job.title} | Finderight</title>
                <meta
                    name="description"
                    content={
                        job.description?.slice(0, 160) ||
                        `Details for ${job.title} recruitment.`
                    }
                />
                <link rel="canonical" href={canonicalUrl} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            </Head>

            {/* MAIN HEADING */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-4">
                {job.title}
            </h1>
            {job.department && (
                <p className="text-center text-lg text-indigo-700 font-semibold mb-6">
                    {job.department}
                </p>
            )}

            {/* ======= TOP INFO (Name of Post / Last Updated / Short Info) ======= */}
            <section className="mb-8 border rounded-lg overflow-hidden">
                <table className="w-full text-sm md:text-base">
                    <tbody>
                        <tr className="border-b">
                            <td className="w-1/4 font-bold text-red-600 p-3 align-top">
                                Name of Post:
                            </td>
                            <td className="p-3 text-blue-700 font-semibold">
                                {job.title}
                            </td>
                        </tr>
                        <tr className="border-b">
                            <td className="font-bold text-red-600 p-3 align-top">
                                Last Updated:
                            </td>
                            <td className="p-3">{formatDateTime(lastUpdated)}</td>
                        </tr>
                        <tr>
                            <td className="font-bold text-red-600 p-3 align-top">
                                Short Information:
                            </td>
                            <td className="p-3 leading-relaxed">
                                {job.description ||
                                    "Detailed notification and eligibility information is provided below."}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* ======= IMPORTANT DATES + APPLICATION FEE (two-column table) ======= */}
            {(job.importantDates || job.applicationFee) && (
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
                                {/* Important Dates */}
                                <td className="align-top p-3 border-r">
                                    {job.importantDates ? (
                                        <ul className="list-disc ml-5 space-y-1">
                                            {job.importantDates.applicationBegin && (
                                                <li>
                                                    Application Begin:{" "}
                                                    <span className="font-semibold">
                                                        {job.importantDates.applicationBegin}
                                                    </span>
                                                </li>
                                            )}
                                            {job.importantDates.lastDateApply && (
                                                <li>
                                                    Apply Last Date:{" "}
                                                    <span className="font-semibold">
                                                        {formatDateOnly(job.importantDates.lastDateApply)}
                                                    </span>
                                                </li>
                                            )}
                                            {job.importantDates.lastDateFee && (
                                                <li>
                                                    Fee Payment Last Date:{" "}
                                                    <span className="font-semibold">
                                                        {formatDateOnly(job.importantDates.lastDateFee)}
                                                    </span>
                                                </li>
                                            )}
                                            {job.importantDates.examDate && (
                                                <li>
                                                    Exam Date:{" "}
                                                    <span className="font-semibold">
                                                        {job.importantDates.examDate}
                                                    </span>
                                                </li>
                                            )}
                                            {job.importantDates.admitCard && (
                                                <li>
                                                    Admit Card:{" "}
                                                    <span className="font-semibold">
                                                        {job.importantDates.admitCard}
                                                    </span>
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <p>—</p>
                                    )}
                                </td>

                                {/* Application Fee */}
                                <td className="align-top p-3">
                                    {job.applicationFee ? (
                                        <div
                                            className="leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: decodeHtml(job.applicationFee),
                                            }}
                                        />
                                    ) : (
                                        <p>—</p>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            )}

            {/* ======= AGE LIMIT SECTION ======= */}
            {job.ageLimit && (
                <section className="mb-8 border rounded-lg p-4">
                    <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-2">
                        Age Limit
                    </h2>
                    <p className="leading-relaxed">{job.ageLimit}</p>
                </section>
            )}

            {/* ======= VACANCY DETAILS ======= */}
            {job.vacancy && (
                <section className="mb-8 border rounded-lg p-4">
                    <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-3">
                        Vacancy Details
                    </h2>
                    <div
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{
                            __html: decodeHtml(job.vacancy),
                        }}
                    />
                </section>
            )}

            {/* ======= ELIGIBILITY (simple paragraph for now) ======= */}
            {job.eligibility && (
                <section className="mb-8 border rounded-lg p-4">
                    <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-2">
                        Eligibility
                    </h2>
                    <p className="leading-relaxed">{job.eligibility}</p>
                </section>
            )}

            {/* ======= IMPORTANT LINKS TABLE (Click Here style) ======= */}
            {job.importantLinks && (
                <section className="mb-10 border rounded-lg overflow-hidden">
                    <h2 className="text-xl md:text-2xl font-bold text-center text-pink-700 py-3 border-b">
                        Some Useful Important Links
                    </h2>

                    <table className="w-full text-sm md:text-base">
                        <tbody>
                            {job.importantLinks.applyOnline && (
                                <tr className="border-b">
                                    <td className="p-3 font-bold text-pink-700">
                                        Apply Online
                                    </td>
                                    <td className="p-3 text-right">
                                        <a
                                            href={job.importantLinks.applyOnline}
                                            target="_blank"
                                            className="text-blue-700 font-semibold underline"
                                        >
                                            Click Here
                                        </a>
                                    </td>
                                </tr>
                            )}

                            {job.importantLinks.downloadNotification && (
                                <tr className="border-b">
                                    <td className="p-3 font-bold text-pink-700">
                                        Download Official Notification
                                    </td>
                                    <td className="p-3 text-right">
                                        <a
                                            href={job.importantLinks.downloadNotification}
                                            target="_blank"
                                            className="text-blue-700 font-semibold underline"
                                        >
                                            Click Here
                                        </a>
                                    </td>
                                </tr>
                            )}

                            {job.importantLinks.officialWebsite && (
                                <tr>
                                    <td className="p-3 font-bold text-pink-700">
                                        Official Website
                                    </td>
                                    <td className="p-3 text-right">
                                        <a
                                            href={job.importantLinks.officialWebsite}
                                            target="_blank"
                                            className="text-blue-700 font-semibold underline"
                                        >
                                            Click Here
                                        </a>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            )}

            {/* BACK LINK */}
            <div className="text-center mt-10">
                <Link
                    href="/jobs"
                    className="text-indigo-600 text-lg font-semibold hover:underline"
                >
                    ← Back to All Jobs
                </Link>
            </div>

            <footer className="mt-6 text-center text-gray-600 text-xs">
                Always verify details from the official website before applying.
            </footer>
        </div>
    );
}
