import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";
import { connectDB } from "@/lib/db";
import QuestionPaper from "@/lib/models/QuestionPaper";

// 1. Updated TypeScript interface to match your new Mongoose Schema
interface IQuestionPaper {
  _id: string;
  title: string;
  slug: string;
  category: string;
  directUrl: string;
  coverImageUrl?: string;
  focusKeywords?: string;
  metaDescription?: string;
  fullDetails?: string;
  createdAt?: string;
  updatedAt?: string;
}

// UPDATE: params is now a Promise
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 2. Fetcher Function (Cached)
const getPaper = cache(async (slug: string): Promise<IQuestionPaper | null> => {
  await connectDB();
  const paper = await QuestionPaper.findOne({ slug }).lean();
  return paper as unknown as IQuestionPaper | null;
});

// 3. Dynamic SEO Metadata using your new fields
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // UPDATE: Await the params Promise
  const resolvedParams = await params;
  const paper = await getPaper(resolvedParams.slug);

  if (!paper) {
    return {
      title: "Document Not Found",
      description: "The requested document could not be found.",
    };
  }

  // Parse comma-separated keywords into an array, with fallbacks
  const keywordsArray = paper.focusKeywords 
    ? paper.focusKeywords.split(",").map(k => k.trim())
    : [paper.title, paper.category, "download pdf"];

  return {
    title: `${paper.title} | Free PDF Download`,
    description: paper.metaDescription || `Download ${paper.title} from our ${paper.category} collection.`,
    keywords: keywordsArray,
    openGraph: {
      title: paper.title,
      description: paper.metaDescription || `Download ${paper.title}`,
      type: "article",
      images: paper.coverImageUrl ? [{ url: paper.coverImageUrl }] : [],
    },
  };
}

// 4. The Page Component
export default async function SinglePaperPage({ params }: PageProps) {
  // UPDATE: Await the params Promise
  const resolvedParams = await params;
  const paper = await getPaper(resolvedParams.slug);

  if (!paper) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      
      <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Cover Image Hero Section */}
        {paper.coverImageUrl && (
          <div className="w-full h-64 sm:h-80 md:h-[400px] relative bg-gray-100 border-b border-gray-100">
            {/* Using standard <img> tag to avoid Next.js external image host config errors */}
            <img 
              src={paper.coverImageUrl} 
              alt={paper.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        <div className="p-8 sm:p-12 md:p-16">
          
          {/* Category Badge */}
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 font-bold text-sm tracking-wide rounded-full border border-blue-100 uppercase">
              {paper.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
            {paper.title}
          </h1>

          {/* Meta Description / Snippet */}
          {paper.metaDescription && (
            <p className="text-lg text-gray-600 mb-10 border-l-4 border-blue-500 pl-5 italic">
              {paper.metaDescription}
            </p>
          )}

          {/* Primary Action Button */}
          <div className="mb-12 pb-12 border-b border-gray-100">
            <a
              href={paper.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 gap-3 text-lg w-full sm:w-auto transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF / Resource
            </a>
          </div>

          {/* Render the Custom HTML (Requires @tailwindcss/typography) */}
          {paper.fullDetails && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Detailed Information
              </h2>
              
              {/* prose class automatically styles raw HTML tags (h1, p, ul, li) beautifully */}
              <div 
                className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: paper.fullDetails }} 
              />
            </div>
          )}
          
        </div>
      </article>
      
    </main>
  );
}