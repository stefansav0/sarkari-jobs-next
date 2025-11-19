import { Metadata } from "next";
import { headers } from "next/headers";
import JobDetailClient from "./JobDetailClient";

interface JobType {
  slug: string;
  title: string;
  department?: string;
  eligibility?: string;
  ageLimit?: string;
  lastDate?: string;
  applicationFee?: string;
  vacancy?: string;
  description?: string;
  importantDates?: {
    applicationBegin?: string;
    lastDateApply?: string;
    lastDateFee?: string;
    examDate?: string;
    admitCard?: string;
  };
  importantLinks?: {
    applyOnline?: string;
    downloadNotification?: string;
    officialWebsite?: string;
  };
}

/* -----------------------------
   FETCH JOB BY SLUG
------------------------------ */
async function getJob(slug: string): Promise<JobType | null> {
  const h = await headers();
  const host = h.get("host")!;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/jobs/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.job || null;
}

/* -----------------------------
   SEO METADATA FIXED
------------------------------ */
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {

  // 🔥 FIX: Await params
  const { slug } = await props.params;

  const job = await getJob(slug);

  if (!job) {
    return {
      title: "Job Not Found | Finderight",
      description: "Requested job details not found.",
    };
  }

  const canonical = `https://finderight.com/jobs/${job.slug}`;

  return {
    title: `${job.title} | Finderight`,
    description:
      job.description?.slice(0, 150) ||
      `Latest recruitment details for ${job.title}.`,

    alternates: { canonical },

    openGraph: {
      title: job.title,
      description:
        job.description?.slice(0, 150) ||
        `Government recruitment details for ${job.title}.`,
      url: canonical,
      type: "article",
      siteName: "Finderight",
    },

    twitter: {
      card: "summary_large_image",
      title: job.title,
      description: job.description?.slice(0, 150) || "",
    },
  };
}

/* -----------------------------
   PAGE RENDER FIXED
------------------------------ */
export default async function Page(
  props: { params: Promise<{ slug: string }> }
) {

  // 🔥 FIX: Await params here too
  const { slug } = await props.params;

  const job = await getJob(slug);

  return <JobDetailClient job={job} />;
}
