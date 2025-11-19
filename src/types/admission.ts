export interface AdmissionType {
    _id: string;
    title: string;
    slug: string;
    eligibility?: string;
    conductedBy?: string;
    ageLimit?: string;
    course?: string;
    applicationFee?: string;
    fullCourseDetails?: string;

    applicationBegin?: string;
    lastDateApply?: string;
    admissionDate?: string;
    examDate?: string;

    publishDate?: string;
    createdAt?: string;
    updatedAt?: string;

    importantLinks?: {
        applyOnline?: string;
        downloadNotice?: string;
        officialWebsite?: string;
        [key: string]: string | undefined;
    };
}
