import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Admission from "@/lib/models/Admission";
import DocumentDetailPageClient from "./DocumentDetailPageClient";
import { AdmissionType } from "@/types/admission";

interface PageProps {
  params: Promise<{ slug: string }>;   // ✅ Must be Promise
}

/* ------------------  Fetch Single Admission  ------------------ */
async function getAdmission(slug: string): Promise<AdmissionType | null> {
  await connectDB();
  const data = await Admission.findOne({ slug }).lean();
  return data ? (JSON.parse(JSON.stringify(data)) as AdmissionType) : null;
}

/* ------------------  SEO Metadata  ------------------ */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;       // ✅ MUST await
  const admission = await getAdmission(slug);

  if (!admission) {
    return {
      title: "Admission Not Found | Finderight",
      description: "Requested admission details could not be found.",
    };
  }

  return {
    title: `${admission.title} | Admission Details`,
    description:
      admission.eligibility ||
      `Get detailed information about ${admission.title}.`,
    alternates: {
      canonical: `https://finderight.com/admission/${admission.slug}`,
    },
    openGraph: {
      title: admission.title,
      description: admission.eligibility || "",
      url: `https://finderight.com/admission/${admission.slug}`,
      type: "article",
      publishedTime: admission.publishDate || admission.createdAt,
      modifiedTime: admission.updatedAt,
    },
  };
}

/* ------------------  Page Component  ------------------ */
export default async function AdmissionDetailPage({ params }: PageProps) {
  const { slug } = await params;       // ✅ MUST await
  const admission = await getAdmission(slug);

  if (!admission) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold">Admission Not Found</h1>
        <p>Please check the URL.</p>
      </div>
    );
  }

  return <DocumentDetailPageClient admission={admission} />;
}
