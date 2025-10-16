"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { ExternalLink, ArrowUp } from "lucide-react";
import Link from "next/link";

interface Admission {
  _id: string;
  slug: string;
  title: string;
}

export default function Admission() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchAdmissions = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admissions?page=${page}`);

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      const newAdmissions = Array.isArray(data.admissions)
        ? data.admissions
        : [];

      setAdmissions((prev) => {
        const combined = [...prev, ...newAdmissions];
        const unique = Array.from(
          new Map(combined.map((item) => [item._id, item])).values()
        );
        return unique;
      });

      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load admissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions(1);
  }, []);

  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          fetchAdmissions(currentPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, currentPage, totalPages]
  );

  useEffect(() => {
    const handleScroll = () =>
      setShowTopButton(window.scrollY > 300);

    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
        Latest Admission Notifications
      </h1>

      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      <div className="space-y-4">
        {admissions.length > 0 ? (
          admissions.map((item, index) => {
            const isLast = index === admissions.length - 1;

            const card = (
              <div className="p-4 border rounded-2xl shadow hover:shadow-lg transition bg-white">
                <Link
                  href={`/admission/${item.slug}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {item.title}
                </Link>

                <div className="mt-3">
                  <Link
                    href={`/admission/${item.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            );

            return (
              <div
                key={item._id}
                ref={isLast ? lastCardRef : null}
              >
                {card}
              </div>
            );
          })
        ) : !error && !loading ? (
          <p className="text-center text-gray-500">
            No admissions available.
          </p>
        ) : null}
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
