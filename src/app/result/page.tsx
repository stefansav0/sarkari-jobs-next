"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
// Removed unused router import
// import { useRouter } from "next/navigation";
import { CalendarDays, ExternalLink, ArrowUp } from "lucide-react";

interface Result {
  _id: string;
  title: string;
  slug: string;
  publishDate: string;
}

interface ApiResponse {
  results: Result[];
  totalPages: number;
  currentPage: number;
}

const ResultsPage = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchResults = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results?page=${page}`);
      const data: ApiResponse = await res.json();

      setResults((prev) => {
        const existingIds = new Set(prev.map((r) => r._id));
        const newUnique = (data.results || []).filter((r) => !existingIds.has(r._id));
        return [...prev, ...newUnique];
      });

      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);
    } catch {
      setError("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(1);
  }, []);

  const lastResultRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchResults(nextPage);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, currentPage, totalPages]
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
        Latest Sarkari Results
      </h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((result, index) => {
            const publishDate = new Date(result.publishDate);
            const isValidDate = !isNaN(publishDate.getTime());

            const card = (
              <div
                className="p-4 border rounded-2xl shadow hover:shadow-lg transition bg-white"
                key={result._id}
              >
                <Link
                  href={`/result/${result.slug}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {result.title}
                </Link>

                {isValidDate && (
                  <div className="text-sm text-gray-500 mt-1 flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {publishDate.toLocaleDateString()}
                  </div>
                )}

                <div className="mt-3">
                  <Link
                    href={`/result/${result.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Download Result <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            );

            return index === results.length - 1 ? (
              <div ref={lastResultRef} key={`${result._id}-last`}>
                {card}
              </div>
            ) : (
              card
            );
          })
        ) : (
          !error && <p className="text-center text-gray-500">No results available.</p>
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
};

export default ResultsPage;
