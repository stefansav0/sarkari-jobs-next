// types/document.ts

export interface DocumentData {
    _id: string;
    title: string;
    conductedBy?: string;
    eligibility?: string;
    ageLimit?: string;
    course?: string;
    applicationFee?: string;
    publishDate?: string;
    fullCourseDetails?: string;
    importantLinks?: Record<string, string>;
}
