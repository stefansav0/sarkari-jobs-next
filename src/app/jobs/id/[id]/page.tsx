"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface Job {
    _id: string;
    slug?: string;
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

// User-defined type guard to check if error is an Error-like object with message property
function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as Record<string, unknown>).message === "string"
    );
}

const JobDetailPage = () => {
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { id } = useParams() as { id: string };
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!id) {
            setError("Invalid job ID.");
            setLoading(false);
            return;
        }

        const fetchJobById = async () => {
            try {
                const res = await fetch(`/api/jobs/id/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch job details.");
                }

                if (data.job) {
                    setJob(data.job);
                    setError(null);

                    if (
                        data.job.slug &&
                        data.job.department &&
                        pathname &&
                        !pathname.includes(data.job.slug)
                    ) {
                        router.replace(`/jobs/${data.job.department}/${data.job.slug}`);
                    }
                } else {
                    setError("Job not found.");
                }
            } catch (err: unknown) {
                if (isErrorWithMessage(err)) {
                    setError(err.message);
                } else {
                    setError("Error loading job details.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchJobById();
    }, [id, pathname, router]);

    if (loading)
        return (
            <p className="text-center mt-10 text-gray-500 animate-pulse">
                Loading job details...
            </p>
        );
    if (error)
        return (
            <p className="text-center mt-10 text-red-500">
                {error}
            </p>
        );
    if (!job)
        return (
            <p className="text-center mt-10 text-red-500">
                Job not found.
            </p>
        );

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">{job.title}</h1>

            <div className="bg-gray-100 p-3 rounded mb-4">
                {job.department && <p><strong>Department:</strong> {job.department}</p>}
                {job.eligibility && <p><strong>Eligibility:</strong> {job.eligibility}</p>}
                {job.ageLimit && <p><strong>Age Limit:</strong> {job.ageLimit}</p>}
                {job.lastDate && (
                    <p><strong>Last Date:</strong> {new Date(job.lastDate).toLocaleDateString()}</p>
                )}
            </div>

            {(job.applicationFee || job.vacancy) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                </div>
            )}

            {job.description && (
                <div className="border p-3 rounded mb-4">
                    <h2 className="text-lg font-semibold mb-1 text-blue-500">Job Description</h2>
                    <p>{job.description}</p>
                </div>
            )}

            {job.importantDates && (
                <div className="border p-3 rounded mb-4">
                    <h2 className="text-lg font-semibold text-blue-500 mb-2">Important Dates</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Application Begin:</strong> {job.importantDates.applicationBegin || "N/A"}</li>
                        <li><strong>Last Date to Apply:</strong> {job.importantDates.lastDateApply || "N/A"}</li>
                        <li><strong>Last Date for Fee Payment:</strong> {job.importantDates.lastDateFee || "N/A"}</li>
                        <li><strong>Exam Date:</strong> {job.importantDates.examDate || "To be announced"}</li>
                        <li><strong>Admit Card:</strong> {job.importantDates.admitCard || "Notified Soon"}</li>
                    </ul>
                </div>
            )}

            {job.importantLinks && (
                <div className="border p-3 rounded mb-4">
                    <h2 className="text-lg font-semibold text-blue-500 mb-2">Important Links</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        {job.importantLinks.applyOnline && (
                            <li><a href={job.importantLinks.applyOnline} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apply Online</a></li>
                        )}
                        {job.importantLinks.downloadNotification && (
                            <li><a href={job.importantLinks.downloadNotification} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download Notification</a></li>
                        )}
                        {job.importantLinks.officialWebsite && (
                            <li><a href={job.importantLinks.officialWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Official Website</a></li>
                        )}
                    </ul>
                </div>
            )}

            <div className="text-center mt-6">
                <Link href="/jobs" className="text-blue-600 hover:underline">← Back to Jobs</Link>
            </div>

            <div className="text-center mt-8 text-sm text-gray-700">
                <p className="font-semibold text-lg mb-2 text-blue-600">Welcome to our official website on Finderight!</p>
                <p className="mb-4">
                    Through this website, you can easily get information related to the latest Job Recruitments, Admissions, Results, Admit Cards, Answer Keys, and News. Bookmark our site and stay connected with us for updates.
                </p>
                <hr className="my-4" />
                <p className="text-red-600 text-xs">
                    <strong>Disclaimer:</strong> The examination results, marks, and job listings published on this website are for information purposes and do not constitute legal documents. Always verify with official sources before proceeding.
                </p>
            </div>
        </div>
    );
};

export default JobDetailPage;
