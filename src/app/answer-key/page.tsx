"use client";

import React, { useEffect, useState, useRef, useCallback, Key } from "react";
import Link from "next/link";
import { ExternalLink, ArrowUp } from "lucide-react";

interface ImportantLinks {
  downloadAnswerKey?: string;
  downloadNotice?: string;
  officialWebsite?: string;
}

interface AnswerKey {
  _id: Key | null | undefined;
  slug: string;
  title: string;
  conductedBy?: string;
  applicationBegin?: string;
  lastDateApply?: string;
  examDate?: string;
  admitad?: string;
  answerKeyRelease?: string;
  publishDate?: string;
  description?: string;
  howToCheck?: string;
  importantLinks?: ImportantLinks;
}

function AnswerKeyList() {
  const [answerKeys, setAnswerKeys] = useState<AnswerKey[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // Removed unused API_BASE_URL

  const fetchAnswerKeys = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/answer-keys?page=${page}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();

      setAnswerKeys((prev) => {
        const combined = [
          ...prev,
          ...(Array.isArray(data.answerKeys) ? data.answerKeys : []),
        ];
        // Remove duplicates by _id
        const unique = Array.from(
          new Map(combined.map((item: AnswerKey) => [item._id, item])).values()
        );
        return unique;
      });

      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);
      setError("");
    } catch {
      setError("Failed to load answer keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswerKeys(1);
  }, []);

  const lastCardRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          fetchAnswerKeys(currentPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, currentPage, totalPages]
  );

  useEffect(() => {
    const handleScroll = () => setShowTopButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
        Latest Answer Keys
      </h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="space-y-4">
        {answerKeys.length > 0 ? (
          answerKeys.map((item, index) => {
            const cardContent = (
              <div
                className="p-4 border rounded-2xl shadow hover:shadow-lg transition bg-white"
                key={item._id}
              >
                <Link
                  href={`/answer-key/${item.slug}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {item.title}
                </Link>

                <div className="mt-3">
                  <Link
                    href={`/answer-key/${item.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            );

            return answerKeys.length === index + 1 ? (
              <div ref={lastCardRef} key={`${item._id}-last`}>
                {cardContent}
              </div>
            ) : (
              cardContent
            );
          })
        ) : (
          !error && (
            <p className="text-center text-gray-500">No answer keys available.</p>
          )
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600" />
        </div>
      )}

      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition z-50"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default AnswerKeyList;
