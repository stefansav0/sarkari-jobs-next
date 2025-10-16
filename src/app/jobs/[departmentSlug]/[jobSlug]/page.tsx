import JobDetailClient from "./JobDetailClient";

interface JobDetailProps {
  params: Promise<{
    departmentSlug: string;
    jobSlug: string;
  }>;
}

// ✅ Mark the function as async
const JobDetail = async ({ params }: JobDetailProps) => {
  // ✅ Await the params
  const { jobSlug } = await params;

  return <JobDetailClient jobSlug={jobSlug} />;
};

export default JobDetail;
