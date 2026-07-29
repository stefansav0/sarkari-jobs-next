"use client";

import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { CalendarDays } from "lucide-react";
import React from "react";

// Safe HTML Decoder for the text fields
function decodeHtml(html) {
    if (!html || html === "<p></p>") return "";
    
    let decodedString = String(html)
        .replace(/\\u003C/g, "<")
        .replace(/\\u003E/g, ">")
        .replace(/\\u002F/g, "/")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");

    // FIX FOR OLD DATA: If there are no block HTML tags, convert plain newlines to <br />
    if (!/<p|br|div|ul|ol|li|table|h[1-6]/i.test(decodedString)) {
        decodedString = decodedString.replace(/\n/g, "<br />");
    }

    return DOMPurify.sanitize(decodedString);
}

export default function DocumentDetailPageClient({ admission }) {
    const document = admission;

    if (!document) return null;

    const renderDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // --- Backward Compatibility for Links ---
    const applyLinks = Array.isArray(document.importantLinks?.applyOnline) 
        ? document.importantLinks.applyOnline 
        : typeof document.importantLinks?.applyOnline === 'string' && document.importantLinks.applyOnline
            ? [{ label: "Apply Online", url: document.importantLinks.applyOnline }]
            : [];

    const noticeLinks = Array.isArray(document.importantLinks?.downloadNotice) 
        ? document.importantLinks.downloadNotice 
        : typeof document.importantLinks?.downloadNotice === 'string' && document.importantLinks.downloadNotice
            ? [{ label: "Download Notice", url: document.importantLinks.downloadNotice }]
            : [];

    // --- Backward Compatibility for Dates (FIX FOR OLD DATA) ---
    let displayDates = document.keyDates || [];
    
    // If keyDates is empty, it's likely an old post. Let's pull from the old static fields.
    if (displayDates.length === 0) {
        if (document.applicationBegin) displayDates.push({ label: "Application Begin", date: document.applicationBegin });
        if (document.lastDateApply) displayDates.push({ label: "Last Date to Apply", date: document.lastDateApply });
        if (document.examDate) displayDates.push({ label: "Exam Date", date: document.examDate });
        if (document.admissionDate) displayDates.push({ label: "Admission Date", date: document.admissionDate });
    }

    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-10 max-w-4xl bg-white shadow-2xl rounded-2xl my-8 md:my-12 border border-gray-100">
            
            {/* HEADER SECTION */}
            <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                    {document.title}
                </h1>
                <div className="flex flex-wrap justify-center gap-3 items-center">
                    {document.conductedBy && (
                        <div className="inline-block bg-teal-50 border border-teal-100 rounded-full px-6 py-2">
                            <p className="text-teal-800 font-semibold text-sm md:text-base">
                                Conducted By: <span className="font-bold">{document.conductedBy}</span>
                            </p>
                        </div>
                    )}
                    {document.status === 'expired' && (
                        <span className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded-full font-bold border border-red-200">
                            Deadline Expired
                        </span>
                    )}
                </div>
            </div>

            {/* INFO & DATES SECTIONS (Now Stacked Vertically for Full Width) */}
            <div className="flex flex-col gap-8 mb-10">
                
                {/* DETAILS CARD */}
                <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition w-full">
                    <h2 className="text-lg font-bold text-white bg-gray-800 py-3 px-5">Admission Details</h2>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm md:text-base text-left">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-1/4 sm:w-1/5 font-semibold text-gray-600 p-4 bg-gray-50 align-top">Course:</td>
                                    <td className="p-4 text-gray-900 align-top leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2">
                                        {decodeHtml(document.course) ? 
                                            <div dangerouslySetInnerHTML={{ __html: decodeHtml(document.course) }} /> 
                                            : "—"
                                        }
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="w-1/4 sm:w-1/5 font-semibold text-gray-600 p-4 bg-gray-50 align-top">Eligibility:</td>
                                    <td className="p-4 text-gray-900 align-top leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold">
                                        {decodeHtml(document.eligibility) ? 
                                            <div dangerouslySetInnerHTML={{ __html: decodeHtml(document.eligibility) }} /> 
                                            : "—"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="w-1/4 sm:w-1/5 font-semibold text-gray-600 p-4 bg-gray-50 align-top">Age Limit:</td>
                                    <td className="p-4 text-gray-900 align-top leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold">
                                        {decodeHtml(document.ageLimit) ? 
                                            <div dangerouslySetInnerHTML={{ __html: decodeHtml(document.ageLimit) }} /> 
                                            : "—"
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* TIMELINE DATES CARD */}
                {displayDates && displayDates.length > 0 && (
                    <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition w-full">
                        <h2 className="text-lg font-bold text-white bg-teal-600 py-3 px-5 flex items-center">
                            <CalendarDays className="w-5 h-5 mr-2" /> Important Dates
                        </h2>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm md:text-base text-left">
                                <tbody>
                                    {displayDates.map((item, index) => {
                                        const isHighlight = item.label.toLowerCase().includes('last') || item.label.toLowerCase().includes('deadline');
                                        return (
                                            <tr className="border-b border-gray-100" key={`date-${index}`}>
                                                <td className={`w-1/3 sm:w-1/4 font-semibold p-4 align-top ${isHighlight ? 'text-red-700 bg-red-50/30' : 'text-gray-600 bg-teal-50/50'}`}>
                                                    {item.label}:
                                                </td>
                                                <td className={`p-4 align-top ${isHighlight ? 'text-red-600 font-bold bg-red-50/10' : 'text-gray-900 font-medium'}`}>
                                                    {renderDate(item.date)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>

            {/* APPLICATION FEE */}
            {document.applicationFee && document.applicationFee !== "<p></p>" && (
                <section className="mb-10 bg-gradient-to-br from-teal-50 to-emerald-50 border-l-4 border-teal-500 p-6 rounded-r-lg shadow-sm">
                    <h2 className="text-xl font-bold text-teal-900 mb-4 flex items-center gap-2">
                        <span>💳</span> Application Fee Structure
                    </h2>
                    <div 
                        className="text-gray-800 prose prose-teal max-w-none text-sm md:text-base leading-relaxed" 
                        dangerouslySetInnerHTML={{ __html: decodeHtml(document.applicationFee) }} 
                    />
                </section>
            )}

            {/* FULL COURSE DETAILS */}
            {document.fullCourseDetails && document.fullCourseDetails !== "<p></p>" && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-teal-600">📖</span> Full Course Details & Vacancies
                    </h2>
                    <div 
                        className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm prose prose-teal max-w-none text-gray-700 leading-relaxed overflow-auto" 
                        dangerouslySetInnerHTML={{ __html: decodeHtml(document.fullCourseDetails) }} 
                    />
                </section>
            )}

            {/* IMPORTANT LINKS */}
            <section className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-teal-100">
                <h2 className="text-xl md:text-2xl font-extrabold text-center text-white bg-gradient-to-r from-teal-600 to-emerald-600 py-4 uppercase tracking-wide">
                    Important Links
                </h2>
                <div className="bg-white overflow-x-auto">
                    <table className="w-full text-sm md:text-base border-collapse">
                        <tbody>
                            
                            {applyLinks.map((link, index) => (
                                <tr className="border-b border-gray-100 hover:bg-gray-50 transition duration-150" key={`apply-${index}`}>
                                    <td className="p-5 font-bold text-teal-900 w-1/2 md:w-2/3 align-middle">
                                        {link.label || 'Apply Online'}
                                    </td>
                                    <td className="p-4 text-center align-middle">
                                        {link.url ? (
                                            <a 
                                                href={link.url.startsWith("http") ? link.url : `https://${link.url}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm md:text-base font-bold rounded-full text-white bg-teal-600 hover:bg-teal-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto min-w-[140px]"
                                            >
                                                Click Here
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center justify-center px-6 py-2.5 text-sm md:text-base font-medium rounded-full text-gray-500 bg-gray-200 cursor-not-allowed min-w-[140px]">
                                                Link Unavailable
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {noticeLinks.map((link, index) => (
                                <tr className="border-b border-gray-100 hover:bg-gray-50 transition duration-150" key={`notice-${index}`}>
                                    <td className="p-5 font-bold text-teal-900 w-1/2 md:w-2/3 align-middle">
                                        {link.label || 'Download Notice'}
                                    </td>
                                    <td className="p-4 text-center align-middle">
                                        {link.url ? (
                                            <a 
                                                href={link.url.startsWith("http") ? link.url : `https://${link.url}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm md:text-base font-bold rounded-full text-white bg-slate-700 hover:bg-slate-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto min-w-[140px]"
                                            >
                                                Click Here
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center justify-center px-6 py-2.5 text-sm md:text-base font-medium rounded-full text-gray-500 bg-gray-200 cursor-not-allowed min-w-[140px]">
                                                Link Unavailable
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {document.importantLinks?.officialWebsite && (
                                <tr className="hover:bg-gray-50 transition duration-150">
                                    <td className="p-5 font-bold text-teal-900 w-1/2 md:w-2/3 align-middle">
                                        Official Website
                                    </td>
                                    <td className="p-4 text-center align-middle">
                                        <a 
                                            href={document.importantLinks.officialWebsite.startsWith("http") ? document.importantLinks.officialWebsite : `https://${document.importantLinks.officialWebsite}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center justify-center px-6 py-2.5 border border-teal-600 text-sm md:text-base font-bold rounded-full text-teal-600 bg-transparent hover:bg-teal-50 hover:shadow-sm transform hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto min-w-[140px]"
                                        >
                                            Click Here
                                        </a>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FOOTER DISCLAIMER */}
            <div className="mt-12 text-center pb-4 border-t border-gray-200 pt-8">
                <p className="font-semibold text-lg mb-2 text-teal-600">Welcome to Finderight!</p>
                <p className="text-gray-600 mb-6 text-sm">
                    Get information about Jobs, Admissions, Results, Admit Cards, Answer Keys and News. Bookmark our website and stay updated.
                </p>
                <p className="text-red-600 text-xs">
                    <strong>Disclaimer:</strong> Please verify details with official notifications. We are not responsible for any errors.
                </p>
                <div className="mt-8">
                    <Link href="/admission" className="inline-flex items-center justify-center text-gray-600 hover:text-teal-600 font-semibold transition group">
                        <span className="transform group-hover:-translate-x-1 transition duration-200 mr-2">←</span> 
                        Back to All Admissions
                    </Link>
                </div>
            </div>
        </main>
    );
}