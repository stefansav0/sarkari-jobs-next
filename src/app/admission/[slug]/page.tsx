import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Admission from "@/lib/models/Admission";
import DocumentDetailPageClient from "./DocumentDetailPageClient";

/* ------------------  Types  ------------------ */
// ✅ Defined directly here since the Client component is now pure .jsx
export interface AdmissionType {
    slug: string;
    title: string;
    conductedBy?: string;
    eligibility?: string;
    ageLimit?: string;
    course?: string;
    applicationFee?: string;
    fullCourseDetails?: string;
    examDate?: string;
    publishDate?: string;
    applicationBegin?: string;
    lastDateApply?: string;
    admissionDate?: string;
    importantLinks?: {
        applyOnline?: { label: string; url: string }[] | string; 
        downloadNotice?: { label: string; url: string }[] | string;
        officialWebsite?: string;
    };
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* ------------------  Fetch Single Admission  ------------------ */
async function getAdmission(slug: string): Promise<AdmissionType | null> {
  await connectDB();
  const data = await Admission.findOne({ slug }).lean();
  return data ? (JSON.parse(JSON.stringify(data)) as AdmissionType) : null;
}

/* ------------------  SEO Metadata  ------------------ */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const admission = await getAdmission(slug);

  if (!admission) {
    return {
      title: "Admission Not Found | Finderight",
      description: "Requested admission details could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `https://finderight.com/admission/${admission.slug}`;
  // Strip HTML from fullCourseDetails for a clean meta description if eligibility is missing
  const cleanDescription = admission.eligibility || admission.fullCourseDetails?.replace(/<[^>]*>?/gm, '') || `Get detailed information and apply online for ${admission.title}.`;

  return {
    title: `${admission.title} | Admission Details`,
    description: cleanDescription.substring(0, 160),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: admission.title,
      description: cleanDescription.substring(0, 160),
      url: canonicalUrl,
      siteName: "Finderight",
      type: "article",
      publishedTime: admission.publishDate || admission.createdAt,
      modifiedTime: admission.updatedAt,
      images: [{ url: "https://finderight.com/og-default.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: admission.title,
      description: cleanDescription.substring(0, 160),
      images: ["https://finderight.com/og-default.png"],
    },
    robots: { index: true, follow: true },
  };
}

/* --------------------------------------
   JSON-LD Schema
--------------------------------------- */
function AdmissionJsonLd(item: AdmissionType) {
  const url = `https://finderight.com/admission/${item.slug}`;
  const cleanDescription = item.eligibility || item.title;

  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: url,
      name: item.title,
      description: cleanDescription,
      datePublished: item.publishDate || item.createdAt || new Date().toISOString(),
      dateModified: item.updatedAt || new Date().toISOString(),
      publisher: {
          "@type": "Organization",
          name: "Finderight",
          logo: {
              "@type": "ImageObject",
              url: "https://finderight.com/logo.png",
          },
      },
  };

  const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://finderight.com" },
          { "@type": "ListItem", position: 2, name: "Admissions", item: "https://finderight.com/admission" },
          { "@type": "ListItem", position: 3, name: item.title, item: url },
      ],
  };

  return (
      <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      </>
  );
}

/* ------------------  Page Component  ------------------ */
export default async function AdmissionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const admission = await getAdmission(slug);

  if (!admission) {
    return (
        <div className="flex flex-col justify-center items-center mt-20 min-h-[50vh] px-4">
            <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center max-w-md w-full shadow-sm">
                <h1 className="text-3xl font-bold text-red-600 mb-3">Admission Not Found</h1>
                <p className="text-gray-600 mb-6">This admission notice may have been removed or the URL is incorrect.</p>
            </div>
        </div>
    );
  }

  return (
    <>
      {AdmissionJsonLd(admission)}
      <DocumentDetailPageClient admission={admission} />
    </>
  );
}