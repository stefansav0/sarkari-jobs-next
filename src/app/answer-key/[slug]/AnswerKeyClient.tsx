"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

/* ------------------  Types  ------------------ */
interface ImportantLinks {
    downloadAnswerKey?: { label: string; url: string }[];
    officialWebsite?: string;
}

export interface AnswerKeyType {
    slug: string;
    title: string;
    conductedby?: string;
    applicationBegin?: string;
    lastDateApply?: string;
    examDate?: string;
    admitcard?: string;
    answerKeyRelease?: string;
    publishDate?: string;
    description?: string;
    howToCheck?: string; // Contains TipTap HTML
    importantLinks?: ImportantLinks;
}

interface AnswerKeyClientProps {
    answerKey: AnswerKeyType;
}

// Safe HTML Decoder for the TipTap fields
function decodeHtml(html?: string) {
    if (!html) return "";
    return html.replace(/\\u003C/g, "<").replace(/\\u003E/g, ">").replace(/\\u002F/g, "/");
}

/* ------------------  Component  ------------------ */
export default function AnswerKeyClient({ answerKey }: AnswerKeyClientProps) {
    if (!answerKey) return null;

    // ✅ FIXED: Changed 'dateString' to 'dateStr' to match the parameter
    const renderDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr); 
        return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // Backward compatibility check for older data where downloadAnswerKey might still be a string
    const downloadLinks = Array.isArray(answerKey.importantLinks?.downloadAnswerKey) 
        ? answerKey.importantLinks?.downloadAnswerKey 
        : typeof answerKey.importantLinks?.downloadAnswerKey === 'string' && answerKey.importantLinks?.downloadAnswerKey
            ? [{ label: "Download Answer Key", url: answerKey.importantLinks.downloadAnswerKey }]
            : [];

    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-10 max-w-4xl bg-white shadow-2xl rounded-2xl my-8 md:my-12 border border-gray-100">
            
            {/* HEADER SECTION */}
            <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                    {answerKey.title}
                </h1>
                {answerKey.conductedby && (
                    <div className="inline-block bg-purple-50 border border-purple-100 rounded-full px-6 py-2">
                        <p className="text-purple-800 font-semibold text-sm md:text-base">
                            Conducted By: <span className="font-bold">{answerKey.conductedby}</span>
                        </p>
                    </div>
                )}
            </div>

            {/* DESCRIPTION SECTION */}
            {answerKey.description && (
                <div className="mb-10 bg-gradient-to-br from-fuchsia-50 to-purple-50 border-l-4 border-purple-500 p-5 rounded-r-lg shadow-sm">
                    <h3 className="font-bold text-purple-900 mb-2 text-lg">📌 Brief Information</h3>
                    <div className="text-gray-700 text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: decodeHtml(answerKey.description) }} />
                </div>
            )}

            {/* INFO & DATES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                
                {/* DETAILS CARD */}
                <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                    <h2 className="text-lg font-bold text-white bg-gray-800 py-3 px-5">Answer Key Details</h2>
                    <div className="p-0">
                        <table className="w-full text-sm md:text-base text-left">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-1/3 font-semibold text-gray-600 p-4 bg-gray-50">Post Name:</td>
                                    <td className="p-4 text-gray-900 font-medium">{answerKey.title}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold text-gray-600 p-4 bg-gray-50">Published On:</td>
                                    <td className="p-4 text-gray-900 font-medium">
                                        {renderDate(answerKey.publishDate)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* TIMELINE DATES CARD */}
                <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                    <h2 className="text-lg font-bold text-white bg-purple-600 py-3 px-5">Important Dates</h2>
                    <div className="p-0">
                        <table className="w-full text-sm md:text-base text-left">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-1/2 font-semibold text-gray-600 p-3 bg-purple-50/50">Application Begin:</td>
                                    <td className="p-3 text-gray-900 font-medium">{renderDate(answerKey.applicationBegin)}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="font-semibold text-gray-600 p-3 bg-purple-50/50">Exam Date:</td>
                                    <td className="p-3 text-gray-900 font-medium">{renderDate(answerKey.examDate)}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold text-gray-600 p-3 bg-purple-50/50">Answer Key Release:</td>
                                    <td className="p-3 text-green-600 font-bold">{renderDate(answerKey.answerKeyRelease)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>

            {/* HOW TO CHECK (TIPTAP HTML RENDERED) */}
            {answerKey.howToCheck && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-purple-600">📖</span> How to Check Answer Key
                    </h2>
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm prose prose-purple max-w-none text-gray-700 leading-relaxed" 
                         dangerouslySetInnerHTML={{ __html: decodeHtml(answerKey.howToCheck) }} 
                    />
                </section>
            )}

            {/* IMPORTANT LINKS (PREMIUM UI) */}
            <section className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-purple-100">
                <h2 className="text-xl md:text-2xl font-extrabold text-center text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 py-4 uppercase tracking-wide">
                    Important Links
                </h2>
                <div className="bg-white">
                    <table className="w-full text-sm md:text-base border-collapse">
                        <tbody>
                            {/* Map over Multiple Download Links */}
                            {downloadLinks.map((link, index) => (
                                <tr className="border-b border-gray-100 hover:bg-gray-50 transition duration-150" key={`download-${index}`}>
                                    <td className="p-5 font-bold text-purple-900 w-1/2 md:w-2/3 align-middle">
                                        {link.label || 'Download Answer Key'}
                                    </td>
                                    <td className="p-4 text-center align-middle">
                                        {link.url ? (
                                            <a 
                                                href={link.url.startsWith("http") ? link.url : `https://${link.url}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm md:text-base font-bold rounded-full text-white bg-purple-600 hover:bg-purple-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
                                            >
                                                Click Here
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center justify-center px-6 py-2.5 text-sm md:text-base font-medium rounded-full text-gray-500 bg-gray-200 cursor-not-allowed">
                                                Link Unavailable
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {/* Official Website */}
                            {answerKey.importantLinks?.officialWebsite && (
                                <tr className="hover:bg-gray-50 transition duration-150">
                                    <td className="p-5 font-bold text-purple-900 w-1/2 md:w-2/3 align-middle">
                                        Official Website
                                    </td>
                                    <td className="p-4 text-center align-middle">
                                        <a 
                                            href={answerKey.importantLinks.officialWebsite.startsWith("http") ? answerKey.importantLinks.officialWebsite : `https://${answerKey.importantLinks.officialWebsite}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center justify-center px-6 py-2.5 border border-purple-600 text-sm md:text-base font-bold rounded-full text-purple-600 bg-transparent hover:bg-purple-50 hover:shadow-sm transform hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
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
                <p className="font-semibold text-lg mb-2 text-purple-600">Welcome to Finderight!</p>
                <p className="text-gray-600 mb-6 text-sm">
                    Get information about Jobs, Admissions, Results, Admit Cards, Answer Keys and News. Bookmark our website and stay updated.
                </p>
                <p className="text-red-600 text-xs">
                    <strong>Disclaimer:</strong> Please verify details with official notifications. We are not responsible for any errors.
                </p>
                <div className="mt-8">
                    <Link href="/answer-key" className="inline-flex items-center justify-center text-gray-600 hover:text-purple-600 font-semibold transition group">
                        <span className="transform group-hover:-translate-x-1 transition duration-200 mr-2">←</span> 
                        Back to All Answer Keys
                    </Link>
                </div>
            </div>
        </main>
    );
}