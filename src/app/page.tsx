"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LatestJobs from "@/components/LatestJobs";
import HomeBannerAd from "@/components/HomeBannerAd";

// Premium Home navigation categories with SVG icons
const homeCategories = [
  { 
    name: "Result", 
    path: "/result",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    name: "Admit Card", 
    path: "/admit-card",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
      </svg>
    )
  },
  { 
    name: "Answer Key", 
    path: "/answer-key",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    )
  },
  { 
    name: "Admission", 
    path: "/admission",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6" />
      </svg>
    )
  },
  { 
    name: "Documents", 
    path: "/documents",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    )
  },
  { 
    name: "Study News", 
    path: "/study-news",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01M9 8h.01M12 8h.01M15 8h.01" />
      </svg>
    )
  },
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

// Updated Interface to support images
interface ApiItem {
  title?: string;
  name?: string;
  slug?: string;
  link?: string;
  createdAt?: string;
  coverImage?: string; // Support for primary image
  image?: string;      // Support for alternative image field
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
/* SARKARI-STYLE BI-DIRECTIONAL MARQUEE NOTIFICATIONS                         */
/* -------------------------------------------------------------------------- */
interface TickerUpdate {
  title: string;
  link: string;
  label: string;
}

const SarkariStyleMarquee = () => {
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
              const slug =
                item.slug ||
                (item.title || item.name || "update")
                  .toString()
                  .toLowerCase()
                  .replace(/\s+/g, "-");
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

  const contentRow1 = [...updates, ...updates, ...updates, ...updates];
  const reversedUpdates = [...updates].reverse();
  const contentRow2 = [...reversedUpdates, ...reversedUpdates, ...reversedUpdates, ...reversedUpdates];

  return (
    <div className="w-full bg-white mb-8 border-y-2 border-gray-200 overflow-hidden py-3">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); } 
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); } 
        }
        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: marquee-left 45s linear infinite;
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marquee-right 45s linear infinite;
        }
        .animate-marquee-left:hover, .animate-marquee-right:hover {
          animation-play-state: paused;
        }
      `,
        }}
      />

      <div className="flex w-full overflow-hidden items-center mb-2">
        <div className="animate-marquee-left items-center gap-4 cursor-pointer">
          {contentRow1.map((u, i) => (
            <div key={`r1-${i}`} className="flex items-center gap-4 whitespace-nowrap">
              <Link
                href={u.link}
                className={`text-[15px] md:text-[17px] font-bold hover:underline ${
                  i % 2 === 0 ? "text-[#0000FF]" : "text-[#FF0000]"
                }`}
              >
                {u.title}
              </Link>
              <span className="text-gray-500 font-bold text-sm md:text-base">||</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full overflow-hidden items-center">
        <div className="animate-marquee-right items-center gap-4 cursor-pointer">
          {contentRow2.map((u, i) => (
            <div key={`r2-${i}`} className="flex items-center gap-4 whitespace-nowrap">
              <Link
                href={u.link}
                className={`text-[15px] md:text-[17px] font-bold hover:underline ${
                  i % 2 !== 0 ? "text-[#0000FF]" : "text-[#FF0000]"
                }`}
              >
                {u.title}
              </Link>
              <span className="text-gray-500 font-bold text-sm md:text-base">||</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* ANIMATED STUDY NEWS SECTION (WITH IMAGES & SKELETONS)                      */
/* -------------------------------------------------------------------------- */
const AnimatedStudyNews = () => {
  const [news, setNews] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback image when no image is provided or if the image link is broken
  const DEFAULT_IMAGE = "https://placehold.co/600x400/e2e8f0/64748b?text=Study+News";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/study-news?limit=6", { cache: "no-store" });
        if (res.ok) {
          const result = (await res.json()) as Record<string, unknown>;
          setNews(parseApiResponse(result).slice(0, 6)); // Ensure max 6 items
        }
      } catch (e) {
        console.error("Failed to fetch study news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Skeleton Loader matching the Image layout
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse flex flex-col h-[340px]">
          <div className="w-full h-40 sm:h-48 bg-gray-200"></div>
          <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow">
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-4/5 mb-4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mt-auto"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!loading && news.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16 w-full">
      <div className="flex justify-between items-end mb-6 sm:mb-8 px-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-red-600 flex items-center gap-2">
            <span className="animate-bounce">📰</span> Trending Study News
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1 font-medium">
            Stay updated with the latest educational announcements.
          </p>
        </div>
        <Link
          href="/study-news"
          className="hidden sm:inline-flex text-blue-600 font-bold text-sm hover:text-red-600 transition-colors items-center gap-1"
        >
          View All <span className="text-lg">→</span>
        </Link>
      </div>

      {loading ? (
        renderSkeletons()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {news.map((item, i) => {
            const slug =
              item.slug ||
              (item.title || item.name || `news-${i}`)
                .toString()
                .toLowerCase()
                .replace(/\s+/g, "-");
            const linkPath = `/study-news/${slug}`;
            const imageUrl = item.coverImage || item.image || DEFAULT_IMAGE;

            return (
              <Link
                key={i}
                href={linkPath}
                className="group relative bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-10"></div>
                {i < 2 && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded animate-pulse shadow-sm tracking-wider z-10">
                    NEW
                  </span>
                )}
                <div className="w-full h-40 sm:h-48 overflow-hidden relative bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={item.title || item.name || "Study News"}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between bg-white">
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                        : "Latest Update"}
                    </div>
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                      {item.title || item.name || "Untitled Update"}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                    Read Full Story
                    <span className="ml-1.5 transform group-hover:translate-x-2 transition-transform duration-300 inline-block">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/study-news"
          className="inline-block w-full py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors"
        >
          View All Study News
        </Link>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* PREMIUM TABLE SECTION (Results, Admit Cards, etc.)                         */
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

  const renderTableSkeletons = () => (
    <div className="flex flex-col">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`flex items-start gap-3 p-3 sm:p-4 ${i !== 4 ? "border-b border-gray-100" : ""}`}>
          <div className="w-6 h-6 rounded bg-gray-200 animate-pulse flex-shrink-0 mt-0.5"></div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 py-3 sm:px-5 sm:py-4 flex justify-between items-center">
        <h2 className="text-base sm:text-lg font-extrabold text-gray-900">{title}</h2>
        <Link 
          href={viewAllPath} 
          className="text-blue-600 text-xs sm:text-sm font-bold hover:text-red-600 transition-colors flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md hover:bg-red-50"
        >
          View All <span>→</span>
        </Link>
      </div>

      <div className="flex-grow flex flex-col">
        {loading ? (
          renderTableSkeletons()
        ) : error ? (
          <p className="text-red-500 text-center py-8 text-sm sm:text-base font-medium">Error: {error}</p>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">No updates available</p>
          </div>
        ) : (
          <ul className="flex flex-col h-full">
            {data.slice(0, 5).map((item, i) => {
              const isLast = i === data.slice(0, 5).length - 1;
              const linkUrl = directLink && item.link 
                ? item.link 
                : `${viewAllPath}/${item.slug || (item.title || item.name || `item-${i}`).toString().toLowerCase().replace(/\s+/g, "-")}`;
              const titleText = item.title || item.name || "Untitled Update";

              return (
                <li 
                  key={i} 
                  className={`group relative transition-colors duration-200 ${!isLast ? "border-b border-gray-100" : ""} hover:bg-blue-50/60`}
                >
                  {directLink && item.link ? (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 sm:p-4 w-full h-full" title={titleText}>
                      <RowContent title={titleText} />
                    </a>
                  ) : (
                    <Link href={linkUrl} className="flex items-start gap-3 p-3 sm:p-4 w-full h-full" title={titleText}>
                      <RowContent title={titleText} />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

const RowContent = ({ title }: { title: string }) => (
  <>
    <div className="flex-shrink-0 text-blue-500 bg-blue-50 p-1.5 rounded border border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 mt-0.5">
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <span className="block text-gray-700 font-semibold group-hover:text-blue-700 transition-colors text-sm sm:text-[15px] leading-snug line-clamp-2 pr-2">
        {title}
      </span>
    </div>
  </>
);

/* -------------------------------------------------------------------------- */
/* HOME PAGE LAYOUT                                                           */
/* -------------------------------------------------------------------------- */
const Home = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative overflow-hidden">
      
      {/* 🚀 Sarkari Style Marquee */}
      <SarkariStyleMarquee />

      {/* Hero Section */}
      <header className="text-center py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-xl shadow-lg">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3 sm:mb-4">
          Find Your Dream Sarkari Job
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
          Get the latest updates on government jobs, results, admit cards, and more.
        </p>
      </header>

      {/* Ad Banner */}
      <section className="mt-8 sm:mt-10">
        <HomeBannerAd />
      </section>

      {/* 🔥 NEW: Premium SEO-Optimized Navigation Categories */}
      <nav aria-label="Main Categories" className="relative mt-8 sm:mt-10 max-w-5xl mx-auto px-2 sm:px-0">
        <ul className="flex overflow-x-auto md:flex-wrap justify-start md:justify-center gap-3 sm:gap-4 pb-4 md:pb-0 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {homeCategories.map((cat) => (
            <li key={cat.path} className="snap-center shrink-0">
              <Link
                href={cat.path}
                className="group flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-blue-400 hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </span>
                <span className="text-sm sm:text-[15px] font-extrabold text-gray-700 group-hover:text-blue-700 tracking-wide">
                  {cat.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Latest Jobs Component */}
      <section className="mt-8 sm:mt-12" aria-labelledby="latest-jobs-heading">
        <h2 id="latest-jobs-heading" className="sr-only">Latest Government Jobs</h2>
        <LatestJobs />
      </section>

      {/* Attractive Animated Study News Section */}
      <AnimatedStudyNews />

      {/* Beautiful Grid Data Sections (Tables) */}
      <section className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6" aria-label="Latest Updates Grid">
        <TableSection title="Latest Results" endpoint="/api/results" />
        <TableSection title="Latest Admit Cards" endpoint="/api/admit-cards" />
        <TableSection title="Latest Answer Keys" endpoint="/api/answer-keys" />
        <TableSection title="Latest Admissions" endpoint="/api/admissions" />
        <TableSection title="Latest Documents" endpoint="/api/documents" directLink />
      </section>

      {/* About Section */}
      <section className="mt-16 sm:mt-24 bg-gray-50 p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-6">About Finderight</h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium">
          Finderight is your one-stop destination for all the latest government job updates, results, admit cards, and admission information in India. We aim to simplify your Sarkari job search by providing accurate, timely, and verified notifications — all in one place.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="mt-12 sm:mt-20 mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 mb-8 sm:mb-10">
          Frequently Asked Questions
        </h2>
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq, index) => (
            <div
              key={index}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:border-blue-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                className="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left focus:outline-none hover:bg-blue-50/50 transition-colors"
              >
                <span itemProp="name" className="font-bold text-gray-900 text-sm sm:text-base pr-4">{faq.question}</span>
                <span
                  className={`text-blue-600 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
                className={`px-5 sm:px-6 transition-all duration-300 overflow-hidden ${
                  openIndex === index ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="w-full h-[1px] bg-gray-100 mb-4"></div>
                <p itemProp="text" className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;