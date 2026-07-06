"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink, ArrowUp, Building2 } from "lucide-react";

interface Result {
  _id: string;
  title: string;
  slug: string;
  postDate: string;       // ✅ Updated from publishDate to match new backend
  conductedBy?: string;   // ✅ Added to show the authority in the UI
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
      setError("Failed to load results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(1);
  }, []);

  // Infinite Scroll Observer
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

  // Scroll to Top Button Logic
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 min-h-screen bg-gray-50">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          Latest Sarkari Results
        </h1>
        <p className="text-gray-500">Stay updated with the latest government exam results</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {results.length > 0 ? (
          results.map((result, index) => {
            const postDate = new Date(result.postDate);
            const isValidDate = !isNaN(postDate.getTime());

            const card = (
              <div
                className="group relative p-5 md:p-6 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
                key={result._id}
              >
                <Link
                  href={`/result/${result.slug}`}
                  className="block text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2"
                >
                  {result.title}
                </Link>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                  {result.conductedBy && (
                    <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                      <Building2 className="w-4 h-4 mr-1.5" />
                      {result.conductedBy}
                    </div>
                  )}
                  
                  
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={`/result/${result.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    View Details & Download <ExternalLink className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>
            );

            // Attach observer to the last element for infinite scroll
            return index === results.length - 1 ? (
              <div ref={lastResultRef} key={`${result._id}-last`}>
                {card}
              </div>
            ) : (
              card
            );
          })
        ) : (
          !error && !loading && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 text-lg">No results available at the moment.</p>
            </div>
          )
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600" />
        </div>
      )}

      {/* Floating Scroll to Top Button */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3.5 rounded-full bg-gray-900 text-white shadow-xl hover:bg-blue-600 hover:-translate-y-1 transition-all duration-200 z-50"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ResultsPage;