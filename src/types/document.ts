export interface DocumentData {
    examDate: string;
    applicationBegin: string;
    lastDateApply: string;
    admissionDate: string;

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
