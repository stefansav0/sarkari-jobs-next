"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ExternalLink } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { DocumentData } from "@/types/document";

const formatDate = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toLocaleDateString("en-GB");
};

export default function DocumentDetailPageClient() {
  const params = useParams();
  const router = useRouter();

  // Defensive check for slug: could be string | string[] | undefined
  let slug: string | undefined;
  if (typeof params?.slug === "string") {
    slug = params.slug;
  } else if (Array.isArray(params?.slug)) {
    slug = params.slug[0]; // just take first if array
  }

  // Hooks always at the top level
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Invalid slug.");
      return;
    }

    async function fetchDocument() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admissions/${slug}`);

        if (!res.ok) {
          throw new Error("Failed to fetch document.");
        }

        const data: DocumentData = await res.json();

        if (!data || !data._id) {
          throw new Error("Document not found.");
        }

        setDocument(data);
      } catch (err) {
        setError((err as Error).message || "Unknown error.");
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [slug]);

  if (loading) return <p>Loading admission details...</p>;

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => router.back()} className="text-blue-600 underline">
          Go Back
        </button>
      </div>
    );
  }

  if (!document) return <p>No document data found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">{document.title}</h1>

      {/* Basic Info */}
      <div className="space-y-2 text-gray-700 text-sm mb-6">
        {document.conductedBy && <p><strong>Conducted By:</strong> {document.conductedBy}</p>}
        {document.eligibility && <p><strong>Eligibility:</strong> {document.eligibility}</p>}
        {document.ageLimit && <p><strong>Age Limit:</strong> {document.ageLimit}</p>}
        {document.course && <p><strong>Courses:</strong> {document.course}</p>}

        {document.applicationFee && (
          <div>
            <strong>Application Fee:</strong>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(document.applicationFee) }} />
          </div>
        )}

        {document.publishDate && (
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            Published: {formatDate(document.publishDate)}
          </p>
        )}
      </div>

      {/* Full Course Details */}
      {document.fullCourseDetails && (
        <div className="border p-4 rounded mb-4 bg-white shadow-sm overflow-auto">
          <h2 className="text-lg font-semibold text-blue-600 mb-2">Full Course Details</h2>
          <div
            className="text-sm text-gray-800 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(document.fullCourseDetails) }}
          />
        </div>
      )}

      {/* Important Links */}
      {document.importantLinks && Object.keys(document.importantLinks).length > 0 && (
        <div className="border p-4 rounded mb-4 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Important Links</h2>
          <ul className="space-y-2 list-disc pl-5">
            {Object.entries(document.importantLinks).map(([key, value]) =>
              value ? (
                <li key={key}>
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    {key.replace(/([A-Z])/g, " $1")} <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}

      {/* Back Link */}
      <div className="text-center mt-6">
        <Link href="/admission" className="text-blue-600 hover:underline font-medium">
          ← Back to admission list
        </Link>
      </div>
    </div>
  );
}
