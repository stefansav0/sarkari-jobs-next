"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ExternalLink, ArrowUp } from "lucide-react";

interface DocumentType {
  _id: string;
  title: string;
  category?: string;
  serviceType?: string;
  description?: string;
  link?: string;
}

export default function Document() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<DocumentType[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showTopButton, setShowTopButton] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchDocuments = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents?page=${page}`);
      const data = await res.json();

      const newDocs: DocumentType[] = Array.isArray(data.documents) ? data.documents : [];

      setDocuments((prevDocs) => {
        const combined = [...prevDocs, ...newDocs];
        const unique = Array.from(new Map(combined.map((item) => [item._id, item])).values());
        return unique;
      });
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(1);
  }, [fetchDocuments]);

  useEffect(() => {
    const allCategories = [
      "All",
      ...new Set(
        documents
          .map((doc) => doc.category)
          .filter((cat): cat is string => typeof cat === "string")
      ),
    ];

    setCategories(allCategories);
  }, [documents]);

  useEffect(() => {
    const filtered =
      selectedCategory === "All"
        ? documents
        : documents.filter((doc) => doc.category === selectedCategory);
    setFilteredDocs(filtered);
  }, [documents, selectedCategory]);

  const lastItemRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          fetchDocuments(currentPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, currentPage, totalPages, fetchDocuments]
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
        Government Document Services
      </h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1 rounded-full text-sm font-medium capitalize ${selectedCategory === cat
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document Cards */}
      <div className="space-y-4">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc, index) => {
            const content = (
              <div
                className="p-4 border rounded-2xl shadow hover:shadow-lg transition bg-white"
                key={doc._id}
              >
                <h2 className="text-lg font-semibold text-blue-600">{doc.title}</h2>

                {(doc.category || doc.serviceType) && (
                  <div className="mt-1 text-sm text-gray-600 capitalize">
                    {doc.category ?? "Document"} — {doc.serviceType ?? "Online"}
                  </div>
                )}

                <p className="mt-2 text-sm text-gray-700">{doc.description}</p>

                <div className="mt-3">
                  <a
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Go to Service <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            );

            return filteredDocs.length === index + 1 ? (
              <div ref={lastItemRef} key={`${doc._id}-last`}>
                {content}
              </div>
            ) : (
              content
            );
          })
        ) : (
          !error && <p className="text-center text-gray-500">No documents found.</p>
        )}
      </div>

      {/* Loader */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div
            className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"
            role="status"
            aria-label="Loading"
          />
        </div>
      )}

      {/* Scroll to Top */}
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
