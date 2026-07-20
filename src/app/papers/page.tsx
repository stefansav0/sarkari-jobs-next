import Link from "next/link";
import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import QuestionPaper from "@/lib/models/QuestionPaper";

// Force Next.js to fetch fresh data on every request
export const dynamic = 'force-dynamic';

// 1. TypeScript interfaces
interface IQuestionPaper {
  _id: object;
  title: string;
  slug: string;
  category: string;
  links: { label: string; url: string }[];
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

// 2. Dynamic SEO Generation based on current filters
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category;
  
  // Dynamically update the page title if a category is selected (Great for SEO!)
  const title = category && category !== "All" 
    ? `${category} Question Papers & Study Materials` 
    : "Resource Library | Download Question Papers & Study Materials";

  return {
    title,
    description: "Browse and download our complete collection of SEO optimized question papers, study materials, and PDF documents.",
  };
}

export default async function PapersListPage({ searchParams }: PageProps) {
  await connectDB();
  
  // 3. Await search params (Next.js 15 breaking change)
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || "";
  const activeCategory = resolvedParams.category || "All";

  // 4. Build the MongoDB Query dynamically
  const dbQuery: any = {};
  if (searchQuery) {
    dbQuery.title = { $regex: searchQuery, $options: "i" };
  }
  if (activeCategory !== "All") {
    dbQuery.category = activeCategory;
  }

  // 5. Fetch Papers & Distinct Categories
  const papers = (await QuestionPaper.find(dbQuery)
    .sort({ createdAt: -1 })
    .lean()) as unknown as IQuestionPaper[];

  // Fetch unique categories to dynamically generate the SEO filter tabs
  const distinctCategories = await QuestionPaper.distinct("category");
  const categories = ["All", ...distinctCategories.filter(Boolean)];

  return (
    <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Simple Blue Page Header (Matching your screenshot style) */}
      <h1 className="text-2xl md:text-4xl font-bold text-center text-blue-700 mb-8 tracking-wide">
        Resource Library Downloads
      </h1>

      {/* Search Bar (Uses native HTML form for SSR & SEO) */}
      <form className="mb-6 relative flex items-center w-full shadow-sm rounded-xl border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
        {/* Preserve category filter if one is already selected */}
        {activeCategory !== "All" && <input type="hidden" name="category" value={activeCategory} />}
        
        <div className="pl-4 text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input 
          type="text" 
          name="q" 
          defaultValue={searchQuery} 
          placeholder="Search documents..." 
          className="w-full py-3 pl-3 pr-4 outline-none text-gray-700 bg-transparent placeholder-gray-400"
        />
        
        <button type="submit" className="px-5 py-3 bg-blue-50 text-blue-700 font-semibold border-l border-gray-300 hover:bg-blue-100 transition-colors">
          Search
        </button>
      </form>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-gray-200 pb-6">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          
          // Build URL parameters cleanly
          const params = new URLSearchParams();
          if (searchQuery) params.set("q", searchQuery);
          if (cat !== "All") params.set("category", cat);
          
          return (
            <Link 
              key={cat} 
              href={`?${params.toString()}`}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                isActive 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>
      
      {/* Raw Row List Layout (As requested from screenshot) */}
      <div className="flex flex-col gap-4">
        {papers.map((paper) => (
          <Link 
            href={`/papers/${paper.slug}`}
            key={paper._id.toString()} 
            className="block w-full bg-white rounded-xl border border-gray-400 p-5 sm:p-6 hover:bg-gray-50 transition-colors"
          >
            {/* Title in bold blue */}
            <h2 className="text-lg sm:text-xl font-bold text-blue-700 mb-3 leading-snug">
              {paper.title}
            </h2>
            
            {/* Link Text with External Icon */}
            <div className="flex items-center gap-1.5 text-blue-600 font-medium text-sm sm:text-base">
              Download / View Details
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Empty State Handle */}
      {papers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-4">
            We couldn't find anything matching "{searchQuery}" {activeCategory !== "All" && `in ${activeCategory}`}.
          </p>
          <Link href="/papers" className="inline-block text-blue-600 font-semibold hover:underline">
            Clear all filters
          </Link>
        </div>
      )}
    </main>
  );
}