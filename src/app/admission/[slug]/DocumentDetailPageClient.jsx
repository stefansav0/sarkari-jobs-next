"use client";

import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { CalendarDays, ExternalLink } from "lucide-react";

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toLocaleDateString("en-GB");
};

export default function DocumentDetailPageClient({ admission }) {
    const document = admission; // rename for compatibility

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Title */}
            <h1 className="text-3xl font-bold text-blue-700 mb-4">
                {document.title}
            </h1>

            {/* Basic Info */}
            <div className="space-y-2 text-gray-700 text-sm mb-6">
                {document.conductedBy && (
                    <p><strong>Conducted By:</strong> {document.conductedBy}</p>
                )}

                {document.eligibility && (
                    <p><strong>Eligibility:</strong> {document.eligibility}</p>
                )}

                {document.ageLimit && (
                    <p><strong>Age Limit:</strong> {document.ageLimit}</p>
                )}

                {document.course && (
                    <p><strong>Courses:</strong> {document.course}</p>
                )}

                {document.applicationFee && (
                    <div>
                        <strong>Application Fee:</strong>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(document.applicationFee),
                            }}
                        />
                    </div>
                )}

                {/* Dates */}
                {document.applicationBegin && (
                    <p>
                        <strong>Application Begins:</strong>{" "}
                        {formatDate(document.applicationBegin)}
                    </p>
                )}

                {document.lastDateApply && (
                    <p>
                        <strong>Last Date to Apply:</strong>{" "}
                        {formatDate(document.lastDateApply)}
                    </p>
                )}

                {document.admissionDate && (
                    <p>
                        <strong>Admission Date:</strong>{" "}
                        {formatDate(document.admissionDate)}
                    </p>
                )}

                {document.examDate && (
                    <p>
                        <strong>Exam Date:</strong> {formatDate(document.examDate)}
                    </p>
                )}

                {document.publishDate && (
                    <p className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        Published: {formatDate(document.publishDate)}
                    </p>
                )}
            </div>

            {/* Full Course Details */}
            {document.fullCourseDetails && (
                <div className="border p-4 rounded mb-4 bg-white shadow-sm overflow-auto">
                    <h2 className="text-lg font-semibold text-blue-600 mb-2">
                        Full Course Details
                    </h2>
                    <div
                        className="text-sm text-gray-800 prose max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(document.fullCourseDetails),
                        }}
                    />
                </div>
            )}

            {/* Important Links */}
            {document.importantLinks &&
                Object.keys(document.importantLinks).length > 0 && (
                    <div className="border p-4 rounded mb-4 bg-white shadow-sm">
                        <h2 className="text-lg font-semibold mb-2 text-blue-600">
                            Important Links
                        </h2>
                        <ul className="space-y-2 list-disc pl-5">
                            {Object.entries(document.importantLinks).map(([key, value]) =>
                                value ? (
                                    <li key={key}>
                                        <a
                                            href={value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center"
                                        >
                                            {key.replace(/([A-Z])/g, " $1")}
                                            <ExternalLink className="w-4 h-4 ml-1" />
                                        </a>
                                    </li>
                                ) : null
                            )}
                        </ul>
                    </div>
                )}

            {/* Back Link */}
            <div className="text-center mt-6">
                <Link
                    href="/admission"
                    className="text-blue-600 hover:underline font-medium"
                >
                    ← Back to admission list
                </Link>
            </div>
        </div>
    );
}
