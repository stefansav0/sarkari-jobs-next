import { ExternalLink, CalendarDays } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

interface AdmitCard {
  title: string;
  slug: string;
  conductedby?: string;
  applicationBegin?: string;
  lastDateApply?: string;
  admitCard?: string;
  examDate?: string;
  publishDate?: string;
  description?: string;
  howToDownload?: string;
  importantLinks?: {
    applyOnline?: string;
    downloadAdmitCard?: string;
    officialWebsite?: string;
  };
}

interface PageProps {
  params: {
    slug: string;
  };
}

async function getAdmitCard(slug: string): Promise<AdmitCard | null> {
  const headersList = await headers();
  const host = headersList.get("host");

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/admit-cards/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data && data._id ? data : null;
}

export default async function AdmitCardDetailPage({ params }: PageProps) {
  const { slug } = params;
  const admitCard = await getAdmitCard(slug);

  if (!admitCard) {
    return (
      <div className="text-center text-red-500 mt-8">
        Admit Card not found or failed to load.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">{admitCard.title}</h1>

      {admitCard.conductedby && (
        <p className="text-gray-800 mb-4">
          <strong>Conducted By:</strong> {admitCard.conductedby}
        </p>
      )}

      <div className="space-y-1 text-gray-700 text-sm mb-6">
        {admitCard.applicationBegin && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Application Begin: {admitCard.applicationBegin}
          </p>
        )}
        {admitCard.lastDateApply && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Last Date to Apply: {admitCard.lastDateApply}
          </p>
        )}
        {admitCard.admitCard && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Admit Card Release: {admitCard.admitCard}
          </p>
        )}
        {admitCard.examDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Exam Date: {admitCard.examDate}
          </p>
        )}
        {admitCard.publishDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Published On:{" "}
            {new Date(admitCard.publishDate).toLocaleDateString("en-IN")}
          </p>
        )}
      </div>

      {admitCard.description && (
        <section className="border p-4 rounded mb-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Description</h2>
          <p>{admitCard.description}</p>
        </section>
      )}

      {admitCard.howToDownload && (
        <section className="border p-4 rounded mb-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">How to Download</h2>
          <p>{admitCard.howToDownload}</p>
        </section>
      )}

      {admitCard.importantLinks && (
        <section className="border p-4 rounded mb-4 bg-white">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Important Links</h2>
          <ul className="space-y-2">
            {admitCard.importantLinks.applyOnline && (
              <li>
                <a
                  href={admitCard.importantLinks.applyOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Apply Online <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </li>
            )}
            {admitCard.importantLinks.downloadAdmitCard && (
              <li>
                <a
                  href={admitCard.importantLinks.downloadAdmitCard}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Download Admit Card <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </li>
            )}
            {admitCard.importantLinks.officialWebsite && (
              <li>
                <a
                  href={admitCard.importantLinks.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Official Website <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </li>
            )}
          </ul>
        </section>
      )}

      <div className="text-center mt-6">
        <Link href="/admit-card" className="text-blue-600 hover:underline font-medium">
          ← Back to Admit Cards
        </Link>
      </div>

      <div className="text-center mt-8 text-sm text-gray-700">
        <p className="font-semibold text-lg mb-2 text-blue-600">
          Welcome to our official website on Finderight!
        </p>
        <p className="mb-4">
          Through this website, you can easily get information related to the latest Job
          Recruitments, Admissions, Results, Admit Cards, Answer Keys, And News. Bookmark
          our site and stay connected with us for updates.
        </p>
        <hr className="my-4" />
        <p className="text-red-600 text-xs">
          <strong>Disclaimer:</strong> The examination results, marks, and job listings
          published on this website are for information to candidates and do not
          constitute a legal document. While we strive to provide accurate
          information, we are not responsible for any inadvertent errors or
          discrepancies. Kindly verify official notifications and information from
          the respective official portals before proceeding.
        </p>
      </div>
    </main>
  );
}
