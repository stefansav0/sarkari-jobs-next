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
  "/api/jobs": "/jobs", 
};

interface TableSectionProps {
  title: string;
  endpoint: string;
  directLink?: boolean; 
}

interface ApiItem {
  title?: string;
  name?: string;
  slug?: string;
  link?: string;
  [key: string]: unknown;
}

const parseApiResponse = (result: Record<string, unknown>): ApiItem[] => {
  const findFirstArray = (obj: Record<string, unknown>): ApiItem[] | null => {
    for (const key in obj) {
      if (Array.isArray(obj[key])) return obj[key] as ApiItem[];
    }
    return null;
  };

  if (Array.isArray(result)) return result as ApiItem[];
  if (Array.isArray(result.data)) return result.data as ApiItem[];
  if (Array.isArray(result.results)) return result.results as ApiItem[];
  
  const arr = findFirstArray(result);
  return arr ? arr : [];
};

/* -------------------------------------------------------------------------- */
/* NEW & IMPROVED: SEAMLESS LIVE UPDATES TICKER                               */
/* -------------------------------------------------------------------------- */
interface TickerUpdate {
  title: string;
  link: string;
  label: string;
}

const TopUpdatesTicker = () => {
  const [updates, setUpdates] = useState<TickerUpdate[]>([]);

  useEffect(() => {
    const fetchTopUpdates = async () => {
      const endpoints = [
        { url: "/api/jobs", label: "New Job" },
        { url: "/api/results", label: "Result" },
        { url: "/api/admit-cards", label: "Admit Card" },
        { url: "/api/answer-keys", label: "Answer Key" },
        { url: "/api/admissions", label: "Admission" },
        { url: "/api/study-news", label: "News" },
      ];

      const promises = endpoints.map(async (ep) => {
        try {
          const res = await fetch(ep.url, { cache: "no-store" });
          if (!res.ok) return null;
          
          const result = (await res.json()) as Record<string, unknown>;
          const parsedData = parseApiResponse(result);

          if (parsedData.length > 0) {
            const item = parsedData[0]; 
            
            let itemLink = item.link || "";
            if (!itemLink) {
              const slug = item.slug || (item.title || item.name || "update").toString().toLowerCase().replace(/\s+/g, "-");
              const basePath = endpointToRouteMap[ep.url];
              itemLink = `${basePath}/${slug}`;
            }

            return {
              title: item.title || item.name || "Latest Update",
              link: itemLink,
              label: ep.label,
            };
          }
        } catch (e) {
          return null; 
        }
        return null;
      });

      const results = await Promise.all(promises);
      setUpdates(results.filter((r): r is TickerUpdate => r !== null));
    };

    fetchTopUpdates();
  }, []);

  if (updates.length === 0) return null; 

  // Duplicate content heavily to ensure a mathematically perfect, seamless infinite loop
  const marqueeContent = [...updates, ...updates, ...updates, ...updates];

  return (
    <div className="relative w-full max-w-7xl mx-auto mb-8 h-14 md:h-16 flex items-center bg-white rounded-full shadow-[0_4px_25px_-5px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
      
      {/* 1. Static "Live Updates" Badge on the left */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-4 md:px-6 bg-gradient-to-r from-red-600 to-rose-500 text-white font-extrabold text-xs md:text-sm tracking-wider uppercase shadow-[4px_0_15px_rgba(225,29,72,0.4)]">
        {/* Pulsing indicator dot */}
        <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3 mr-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-white"></span>
        </span>
        Notification
      </div>

      {/* 2. White gradient fade masks to soften the scrolling text entering/exiting */}
      <div className="absolute left-[135px] md:left-[175px] top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-white to-transparent z-10 rounded-r-full pointer-events-none"></div>

      {/* 3. Inline Styles for Seamless Marquee Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes seamless-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); } 
        }
        .animate-seamless-marquee {
          display: flex;
          width: max-content;
          animation: seamless-marquee 40s linear infinite;
        }
        .animate-seamless-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
      
      {/* 4. Scrolling Content Container */}
      <div className="flex w-full overflow-hidden items-center h-full pl-[150px] md:pl-[200px]">
        <div className="animate-seamless-marquee items-center gap-8 md:gap-14 py-2 cursor-pointer">
          {marqueeContent.map((u, i) => (
            <Link key={i} href={u.link} className="group flex items-center gap-3 whitespace-nowrap">
              <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {u.label}
              </span>
              <span className="text-sm md:text-base font-semibold text-gray-700 group-hover:text-red-600 transition-colors duration-300">
                {u.title}
              </span>
              {/* Bullet separator */}
              <span className="text-gray-300 ml-4 hidden md:inline-block">•</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* TABLE SECTION                                */
/* -------------------------------------------------------------------------- */
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

        setData(parseApiResponse(result));
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

/* -------------------------------------------------------------------------- */
/* HOME PAGE                                   */
/* -------------------------------------------------------------------------- */
const Home = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
      
      {/* 🚀 Sleek Top Updates Marquee Ticker */}
      <TopUpdatesTicker />

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