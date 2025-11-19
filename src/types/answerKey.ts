// src/types/answerKey.ts

export interface ImportantLinks {
    downloadAnswerKey?: string;
    downloadNotice?: string;
    officialWebsite?: string;
}

export interface AnswerKeyType {
    _id?: string;
    slug: string;
    title: string;

    conductedBy?: string;
    applicationBegin?: string;
    lastDateApply?: string;
    examDate?: string;
    admitad?: string; // Some APIs use this field
    answerKeyRelease?: string;

    publishDate?: string;
    description?: string;
    howToCheck?: string;

    importantLinks?: ImportantLinks;

    createdAt?: string;
    updatedAt?: string;
}
