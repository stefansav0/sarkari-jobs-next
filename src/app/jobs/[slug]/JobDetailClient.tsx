"use client";

import Head from "next/head";
import Link from "next/link";

/* -------------------------------
   Full Job Type (Strict Typing)
-------------------------------- */
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
    applicationFee?: string;
    vacancy?: string;
    description?: string;
    importantDates?: ImportantDates;
    importantLinks?: ImportantLinks;
}

/* Props type → No more ANY */
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

/* -------- SAFE DATE FORMATTER -------- */
function formatDateSafe(value: string | undefined): string {
    if (!value) return "—";

    // If value contains alphabets → return raw
    if (/^[a-zA-Z ]+$/.test(value)) return value;

    const date = new Date(value);

    if (isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

/* -------- COMPONENT -------- */
export default function JobDetailClient({ job }: JobDetailClientProps) {
    if (!job) {
        return (
            <div className="text-center text-red-600 text-xl mt-10 font-semibold">
                ❌ Job not found.
            </div>
        );
    }

    const canonicalUrl = `https://finderight.com/jobs/${job.slug}`;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.description,
        datePosted: job.importantDates?.applicationBegin || new Date().toISOString(),
        validThrough: job.lastDate || undefined,
        hiringOrganization: {
            "@type": "Organization",
            name: job.department || "Finderight",
            sameAs: "https://finderight.com",
        },
        employmentType: "FULL_TIME",
        jobLocation: {
            "@type": "Place",
            address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
            },
        },
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl bg-white shadow-xl rounded-xl my-10">

            {/* SEO Metadata */}
            <Head>
                <title>{job.title} | Finderight</title>
                <meta
                    name="description"
                    content={job.description?.slice(0, 160) || `Details for ${job.title}`}
                />
                <link rel="canonical" href={canonicalUrl} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            </Head>

            {/* TITLE */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-3">
                {job.title}
            </h1>

            <p className="text-center text-lg text-indigo-600 font-medium mb-6">
                {job.department || "Recruitment Details"}
            </p>

            {/* KEY HIGHLIGHTS */}
            <div className="bg-indigo-50 p-5 rounded-lg border-l-4 border-indigo-600 mb-8">
                <h2 className="text-xl font-bold text-indigo-700 mb-3">Key Highlights</h2>

                <ul className="text-gray-700 space-y-1">
                    <li><strong>Eligibility:</strong> {job.eligibility || "—"}</li>
                    <li><strong>Age Limit:</strong> {job.ageLimit || "—"}</li>
                    <li><strong>Last Date:</strong> {formatDateSafe(job.lastDate)}</li>
                </ul>
            </div>

            {/* DESCRIPTION */}
            {job.description && (
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-indigo-700 mb-2">Job Description</h2>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {job.description}
                    </p>
                </section>
            )}

            {/* FEE + VACANCY */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

                {job.applicationFee && (
                    <div className="border p-5 rounded-lg bg-gray-50 shadow">
                        <h2 className="text-xl font-bold text-indigo-700 mb-2">Application Fee</h2>
                        <div
                            className="prose"
                            dangerouslySetInnerHTML={{ __html: decodeHtml(job.applicationFee) }}
                        />
                    </div>
                )}

                {job.vacancy && (
                    <div className="border p-5 rounded-lg bg-gray-50 shadow">
                        <h2 className="text-xl font-bold text-indigo-700 mb-2">Vacancy Details</h2>
                        <div
                            className="prose"
                            dangerouslySetInnerHTML={{ __html: decodeHtml(job.vacancy) }}
                        />
                    </div>
                )}
            </section>

            {/* IMPORTANT DATES */}
            {job.importantDates && (
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-indigo-700 mb-4">Important Dates</h2>

                    <table className="w-full border rounded-lg text-gray-700">
                        <tbody>
                            {Object.entries(job.importantDates).map(([key, value]) => (
                                <tr key={key} className="border-b">
                                    <td className="p-3 font-semibold capitalize">
                                        {key.replace(/([A-Z])/g, " $1")}
                                    </td>
                                    <td className="p-3">{formatDateSafe(value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* IMPORTANT LINKS */}
            {job.importantLinks && (
                <section className="mb-10 bg-indigo-50 p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
                        Important Links
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        {job.importantLinks.applyOnline && (
                            <a
                                href={job.importantLinks.applyOnline}
                                target="_blank"
                                className="bg-green-600 hover:bg-green-700 text-white p-3 font-semibold rounded-lg text-center"
                            >
                                Apply Online
                            </a>
                        )}

                        {job.importantLinks.downloadNotification && (
                            <a
                                href={job.importantLinks.downloadNotification}
                                target="_blank"
                                className="bg-blue-600 hover:bg-blue-700 text-white p-3 font-semibold rounded-lg text-center"
                            >
                                Notification
                            </a>
                        )}

                        {job.importantLinks.officialWebsite && (
                            <a
                                href={job.importantLinks.officialWebsite}
                                target="_blank"
                                className="bg-gray-700 hover:bg-gray-800 text-white p-3 font-semibold rounded-lg text-center"
                            >
                                Official Website
                            </a>
                        )}
                    </div>
                </section>
            )}

            {/* BACK */}
            <div className="text-center mt-10">
                <Link href="/jobs" className="text-indigo-600 text-lg font-semibold hover:underline">
                    ← Back to All Jobs
                </Link>
            </div>

            <footer className="mt-10 text-center text-gray-600 text-sm">
                Always verify information from official government sources.
            </footer>
        </div>
    );
}
