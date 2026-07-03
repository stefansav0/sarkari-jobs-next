"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ExternalLink, ArrowUp, ArrowRight, Image as ImageIcon, FileText, LayoutGrid } from "lucide-react";
import Link from "next/link";

interface DocumentType {
  _id: string;
  title: string;
  category?: string;
  serviceType?: string;
  description?: string;
  fullDescription?: string;
  contentFormat?: "html" | "text";
  coverImageUrl?: string;
  link?: string;
  slug?: string;
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
        // Remove duplicates based on _id
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

  // Initial Fetch
  useEffect(() => {
    fetchDocuments(1);
  }, [fetchDocuments]);

  // Extract unique categories whenever documents change
  useEffect(() => {
    const allCategories = [
      "All",
      ...new Set(
        documents
          .map((doc) => doc.category)
          .filter((cat): cat is string => typeof cat === "string" && cat.trim() !== "")
      ),
    ];

    setCategories(allCategories);
  }, [documents]);

  // Filter documents based on selected category
  useEffect(() => {
    const filtered =
      selectedCategory === "All"
        ? documents
        : documents.filter((doc) => doc.category === selectedCategory);
    setFilteredDocs(filtered);
  }, [documents, selectedCategory]);

  // Infinite Scroll Observer
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

  // Scroll to top visibility toggle
  useEffect(() => {
    const handleScroll = () => setShowTopButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header Section */}
      <div className="bg-white border-b border-slate-200 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center shadow-sm">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Government <span className="text-blue-600">Document Services</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Access, download, and manage official applications and forms securely in one unified directory.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center mb-8 font-medium">
            {error}
          </div>
        )}

        {/* Category Filters (Scrollable on mobile) */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-3 no-scrollbar justify-start md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 transform scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc, index) => {
              const isLastElement = filteredDocs.length === index + 1;
              
              return (
                <div
                  ref={isLastElement ? lastItemRef : null}
                  className="group flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5"
                  key={doc._id}
                >
                  {/* Card Image Area */}
                  <div className="aspect-[16/10] w-full relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-b border-slate-100">
                    {/* Floating Category Badge */}
                    {(doc.category) && (
                      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 uppercase tracking-wide shadow-sm">
                        {doc.category}
                      </div>
                    )}
                    
                    {/* Floating Service Type Badge (if any) */}
                    {doc.serviceType && (
                      <div className="absolute top-4 right-4 z-10 bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm">
                        {doc.serviceType}
                      </div>
                    )}

                    {doc.coverImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={doc.coverImageUrl} 
                        alt={doc.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}

                    {/* Fallback Graphic (shows if no image or image fails) */}
                    <div className={`absolute inset-0 flex items-center justify-center ${doc.coverImageUrl ? 'hidden' : 'flex'}`}>
                      <LayoutGrid className="w-16 h-16 text-slate-300/50" />
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
                      {doc.title}
                    </h2>

                    {doc.description ? (
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6 flex-grow">
                        {doc.description}
                      </p>
                    ) : (
                      <div className="flex-grow"></div> /* Spacer if no description */
                    )}

                    {/* Actions / Footer */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
                      <Link
                        href={`/documents/${doc.slug || doc._id}`}
                        className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View Details <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                      </Link>

                      {doc.link && (
                        <a
                          href={doc.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                          title="Official Service Link"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            !loading && !error && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No documents found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  We couldn't find any documents matching the category "{selectedCategory}". Try selecting another category or check back later.
                </p>
              </div>
            )
          )}
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div
              className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 shadow-sm"
              role="status"
              aria-label="Loading"
            />
          </div>
        )}
      </div>

      {/* Scroll to Top */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3.5 rounded-full bg-slate-900 text-white shadow-xl hover:bg-blue-600 hover:-translate-y-1.5 transition-all duration-300 z-50 ring-4 ring-white/50"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}