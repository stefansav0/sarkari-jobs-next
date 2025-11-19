"use client";

import { ExternalLink, CalendarDays } from "lucide-react";
import Link from "next/link";
import React from "react";

/* ------------------  Types  ------------------ */
interface ImportantLinks {
    downloadAnswerKey?: string;
    downloadNotice?: string;
    officialWebsite?: string;
}

export interface AnswerKeyType {
    slug: string;
    title: string;
    conductedBy?: string;
    applicationBegin?: string;
    lastDateApply?: string;
    examDate?: string;
    admitad?: string;
    answerKeyRelease?: string;
    publishDate?: string;
    description?: string;
    howToCheck?: string;
    importantLinks?: ImportantLinks;
}

interface AnswerKeyClientProps {
    answerKey: AnswerKeyType;
}

/* ------------------  Component  ------------------ */

export default function AnswerKeyClient({ answerKey }: AnswerKeyClientProps) {
    if (!answerKey) {
        return (
            <div className="text-center text-red-500 mt-8">
                Answer Key data is missing.
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-blue-700 mb-2">
                {answerKey.title}
            </h1>

            {answerKey.conductedBy && (
                <p className="font-semibold italic text-gray-700 mb-4">
                    <strong>Conducted By:</strong> {answerKey.conductedBy}
                </p>
            )}

            <div className="space-y-2 text-sm text-gray-800 mb-6">
                {answerKey.applicationBegin && (
                    <p className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        Application Begin: {answerKey.applicationBegin}
                    </p>
                )}
                {answerKey.lastDateApply && (
                    <p className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        Last Date to Apply: {answerKey.lastDateApply}
                    </p>
                )}
                {answerKey.examDate && (
                    <p className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        Exam Date: {answerKey.examDate}
                    </p>
                )}
                {answerKey.admitad && (
                    <p className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        Admit Card: {answerKey.admitad}
                    </p>
                )}
                {answerKey.answerKeyRelease && (
                    <p className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        Answer Key Release: {answerKey.answerKeyRelease}
                    </p>
                )}
                {answerKey.publishDate && (
                    <p className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        Published On:{" "}
                        {new Date(answerKey.publishDate).toLocaleDateString()}
                    </p>
                )}
            </div>

            {answerKey.description && (
                <div className="border rounded bg-gray-50 p-4 mb-4">
                    <h2 className="text-lg font-semibold text-blue-600 mb-2">
                        Description
                    </h2>
                    <p className="text-gray-800">{answerKey.description}</p>
                </div>
            )}

            {answerKey.howToCheck && (
                <div className="border rounded bg-gray-50 p-4 mb-4">
                    <h2 className="text-lg font-semibold text-blue-600 mb-2">
                        How to Check
                    </h2>
                    <p className="text-gray-800">{answerKey.howToCheck}</p>
                </div>
            )}

            {answerKey.importantLinks && (
                <div className="border rounded bg-gray-50 p-4 mb-4">
                    <h2 className="text-lg font-semibold text-blue-600 mb-2">
                        Important Links
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 text-blue-600">
                        {answerKey.importantLinks.downloadAnswerKey && (
                            <li>
                                <a
                                    href={answerKey.importantLinks.downloadAnswerKey}
                                    target="_blank"
                                    className="hover:underline flex items-center"
                                >
                                    Download Answer Key{" "}
                                    <ExternalLink className="w-4 h-4 ml-1" />
                                </a>
                            </li>
                        )}

                        {answerKey.importantLinks.downloadNotice && (
                            <li>
                                <a
                                    href={answerKey.importantLinks.downloadNotice}
                                    target="_blank"
                                    className="hover:underline flex items-center"
                                >
                                    Download Notice{" "}
                                    <ExternalLink className="w-4 h-4 ml-1" />
                                </a>
                            </li>
                        )}

                        {answerKey.importantLinks.officialWebsite && (
                            <li>
                                <a
                                    href={answerKey.importantLinks.officialWebsite}
                                    target="_blank"
                                    className="hover:underline flex items-center"
                                >
                                    Official Website{" "}
                                    <ExternalLink className="w-4 h-4 ml-1" />
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
            )}

            <div className="text-center mt-6">
                <Link
                    href="/answer-key"
                    className="text-blue-600 hover:underline font-medium"
                >
                    ← Back to Answer Keys
                </Link>
            </div>
        </div>
    );
}
