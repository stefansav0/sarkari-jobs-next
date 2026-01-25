"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LatestJobs from "@/components/LatestJobs";
import HomeBannerAd from "@/components/HomeBannerAd";

// Home navigation categories
const homeCategories = [
  { name: "Result", path: "/result" },
  { name: "Admit Card", path: "/admit-card" },
  { name: "Answer Key", path: "/answer-key" },
  { name: "Admission", path: "/admission" },
  { name: "Documents", path: "/documents" },
  { name: "Study News", path: "study-news"},
];

// FAQ data
const faqs = [
  {
    question: "What kind of jobs are listed on Finderight?",
    answer:
      "Finderight provides information on various government job opportunities across India, including central and state-level recruitments such as UPSC, SSC, Railway, Defence, Banking, Teaching, and PSU vacancies. Please note that Finderight is an independent platform and does not guarantee job offers.",
  },
  {
    question: "Is Finderight free to use?",
    answer:
      "Yes, Finderight is completely free for all users. You can access job listings, results, admit cards, and answer keys without any subscription or hidden charges. However, we do not take responsibility for third-party links or content.",
  },
  {
    question: "How can I get job alerts?",
    answer:
      "You can sign up for our free email newsletter to receive the latest Sarkari job notifications directly in your inbox. We respect your privacy—your data is securely handled and will never be shared with third parties without your consent.",
  },
];

// Map API endpoints to frontend routes
const endpointToRouteMap: Record<string, string> = {
  "/api/results": "/result",
  "/api/admit-cards": "/admit-card",
  "/api/answer-keys": "/answer-key",
  "/api/admissions": "/admission",
  "/api/documents": "/documents",
  "/api/study-news": "/study-news",
};

interface TableSectionProps {
  title: string;
  endpoint: string;
  directLink?: boolean; // for documents with direct URLs
}

// Define the shape of items returned by APIs
interface ApiItem {
  title?: string;
  name?: string;
  slug?: string;
  link?: string;
  [key: string]: unknown; // catch-all for extra fields
}

const TableSection = ({ title, endpoint, directLink = false }: TableSectionProps) => {
  const [data, setData] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = (await res.json()) as Record<string, unknown>;

        const findFirstArray = (obj: Record<string, unknown>): ApiItem[] | null => {
          for (const key in obj) {
            if (Array.isArray(obj[key])) return obj[key] as ApiItem[];
          }
          return null;
        };

        let parsedData: ApiItem[] = [];
        if (Array.isArray(result)) parsedData = result as ApiItem[];
        else if (Array.isArray(result.data)) parsedData = result.data as ApiItem[];
        else if (Array.isArray(result.results)) parsedData = result.results as ApiItem[];
        else {
          const arr = findFirstArray(result);
          if (arr) parsedData = arr;
        }

        setData(parsedData);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error fetching data";
        setError(message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [endpoint, title]);

  const viewAllPath = endpointToRouteMap[endpoint] || "/";

  return (
    <section className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-4 sm:p-6 flex flex-col justify-between w-full sm:w-[48%] lg:w-[32%] xl:w-[19%] min-h-[260px]">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
          <Link href={viewAllPath} className="text-blue-600 text-sm hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-6 text-sm sm:text-base">Loading {title}...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-6 text-sm sm:text-base">Error: {error}</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500 text-center py-10 text-sm sm:text-base">No data available.</p>
        ) : (
          <ul className="space-y-2">
            {data.slice(0, 5).map((item, i) => {
              if (directLink && item.link) {
                return (
                  <li key={i}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline truncate text-sm sm:text-base"
                      title={item.title || item.name || "Untitled"}
                    >
                      {item.title || item.name || "Untitled"}
                    </a>
                  </li>
                );
              } else {
                const slug =
                  item.slug || (item.title || item.name || `item-${i}`)
                    .toString()
                    .toLowerCase()
                    .replace(/\s+/g, "-");
                const linkPath = `${viewAllPath}/${slug}`;
                return (
                  <li key={i}>
                    <Link
                      href={linkPath}
                      className="block text-blue-600 hover:underline truncate text-sm sm:text-base"
                      title={item.title || item.name || "Untitled"}
                    >
                      {item.title || item.name || "Untitled"}
                    </Link>
                  </li>
                );
              }
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

const Home = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
      {/* Hero Section */}
      <section className="text-center py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-xl shadow-lg">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3 sm:mb-4">
          Find Your Dream Sarkari Job
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90">
          Get the latest updates on government jobs, results, admit cards, and more.
        </p>
      </section>

      {/* Ad Banner */}
      <section className="mt-8 sm:mt-10">
        <HomeBannerAd />
      </section>

      {/* Navigation Categories */}
      <nav
        aria-label="Home category navigation"
        className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8 sm:mt-10"
      >
        {homeCategories.map((cat) => (
          <Link
            key={cat.path}
            href={cat.path}
            className="px-4 sm:px-6 py-2 text-xs sm:text-sm md:text-base rounded-full border border-gray-300 bg-white hover:bg-blue-50 hover:text-blue-700 font-medium shadow-sm transition"
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      {/* Latest Jobs */}
      <section className="mt-8 sm:mt-12">
        <LatestJobs />
      </section>

      {/* Dynamic Data Sections */}
      <section className="mt-10 sm:mt-14 flex flex-wrap justify-center sm:justify-between gap-4 sm:gap-6">
        <TableSection title="Latest Results" endpoint="/api/results" />
        <TableSection title="Latest Admit Cards" endpoint="/api/admit-cards" />
        <TableSection title="Latest Answer Keys" endpoint="/api/answer-keys" />
        <TableSection title="Latest Admissions" endpoint="/api/admissions" />
        <TableSection title="Letest Study News" endpoint="/api/study-news" />
        <TableSection title="Latest Documents" endpoint="/api/documents" directLink />
      </section>

      {/* About Section */}
      <section className="mt-12 sm:mt-20 bg-gray-50 p-6 sm:p-8 rounded-xl shadow-sm text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">About Finderight</h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
          Finderight is your one-stop destination for all the latest government job updates, results, admit cards, and admission information in India. We aim to simplify your Sarkari job search by providing accurate, timely, and verified notifications — all in one place.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="mt-12 sm:mt-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-10">
          FAQ - Finderight
        </h2>
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                className="w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 text-left focus:outline-none hover:bg-blue-50"
              >
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{faq.question}</span>
                <span
                  className={`text-blue-600 text-xl sm:text-2xl transform transition-transform duration-300 ${openIndex === index ? "rotate-45" : ""
                    }`}
                >
                  +
                </span>
              </button>
              <div
                className={`px-4 sm:px-6 transition-all duration-300 overflow-hidden ${openIndex === index ? "max-h-48 py-3 sm:py-4" : "max-h-0"
                  }`}
              >
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
