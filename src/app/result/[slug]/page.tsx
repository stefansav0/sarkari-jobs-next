import React from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink } from "lucide-react";
import { headers } from "next/headers";

// ✅ Define types
interface ImportantLink {
  label: string;
  url: string;
}

interface Result {
  slug: string;
  title: string;
  conductedBy?: string;
  examDate?: string;
  resultDate?: string;
  postDate?: string;
  shortInfo?: string;
  howToCheck?: string;
  importantLinks?: ImportantLink[];
}

// ✅ Server-side data fetch with absolute URL
async function getResult(slug: string): Promise<Result | null> {
  const headersList = headers();
  const host = (await headersList).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/results/${slug}`, {
    next: { revalidate: 60 }, // ISR: Cache for 60s
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data && data.slug ? data : null;
}

// ✅ Page component
const ResultDetailPage = async ({ params }: { params: { slug: string } }) => {
  const result = await getResult(params.slug);

  if (!result) {
    return (
      <div className="text-center text-red-500 mt-8">
        Result not found or failed to load.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">{result.title}</h1>

      <div className="space-y-2 text-gray-700 text-sm mb-6">
        {result.conductedBy && (
          <p>
            <strong>Conducted By:</strong> {result.conductedBy}
          </p>
        )}
        {result.examDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Exam Date: {result.examDate}
          </p>
        )}
        {result.resultDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Result Date: {result.resultDate}
          </p>
        )}
        {result.postDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Published On: {new Date(result.postDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* 📝 Notice Section */}
      {result.shortInfo && (
        <section className="border p-4 rounded mb-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Notice</h2>
          <p>{result.shortInfo}</p>
        </section>
      )}

      {/* 📋 How to Check Result */}
      {result.howToCheck && (
        <section className="border p-4 rounded mb-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">
            How to Check Result
          </h2>
          <p>{result.howToCheck}</p>
        </section>
      )}

      {/* 🔗 Important Links */}
      {Array.isArray(result.importantLinks) && result.importantLinks.length > 0 && (
        <section className="border p-4 rounded mb-4 bg-white">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Important Links</h2>
          <ul className="space-y-2">
            {result.importantLinks.map((link: ImportantLink, idx: number) => (
              <li key={idx}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  {link.label} <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}


      {/* 🔙 Back to Results */}
      <div className="text-center mt-6">
        <Link href="/result" className="text-blue-600 hover:underline font-medium">
          ← Back to Results
        </Link>
      </div>

      {/* 🧾 Footer Note */}
      <div className="text-center mt-8 text-sm text-gray-700">
        <p className="font-semibold text-lg mb-2 text-blue-600">
          Welcome to our official website on Finderight!
        </p>
        <p className="mb-4">
          Through this website, you can easily get information related to the latest
          Job Recruitments, Admissions, Results, Admit Cards, Answer Keys, And News.
          Bookmark our site and stay connected with us for updates.
        </p>

        <hr className="my-4" />

        <p className="text-red-600 text-xs">
          <strong>Disclaimer:</strong> The examination results, marks, and job
          listings published on this website are for informational purposes only and do
          not constitute a legal document. Always verify with the official portals.
        </p>
      </div>
    </main>
  );
};

export default ResultDetailPage;
