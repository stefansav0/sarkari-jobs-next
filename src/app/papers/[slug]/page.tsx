import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import QuestionPaper from "@/lib/models/QuestionPaper";

// 1. Updated TypeScript interface
interface IQuestionPaper {
  _id: string;
  title: string;
  slug: string;
  category: string;
  links: { label: string; url: string }[]; 
  coverImageUrl?: string;
  focusKeywords?: string;
  metaDescription?: string;
  fullDetails?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 2. Next.js 15+ Params Interface
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// --- HELPERS FOR SAFE HTML RENDERING ---
function decodeHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/\\u003C/g, "<")
    .replace(/\\u003E/g, ">")
    .replace(/\\u002F/g, "/");
}

function stripHtml(html?: string): string {
  if (!html) return "";
  const decoded = decodeHtml(html);
  return decoded.replace(/<[^>]*>?/gm, '');
}
// ---------------------------------------

// 3. Fetcher Function (Cached)
const getPaper = cache(async (slug: string): Promise<IQuestionPaper | null> => {
  await connectDB();
  const paper = await QuestionPaper.findOne({ slug }).lean();
  return paper as unknown as IQuestionPaper | null;
});

// 4. Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const paper = await getPaper(resolvedParams.slug);

  if (!paper) {
    return {
      title: "Document Not Found",
      description: "The requested document could not be found.",
    };
  }

  const keywordsArray = paper.focusKeywords 
    ? paper.focusKeywords.split(",").map(k => k.trim())
    : [paper.title, paper.category, "download pdf"].filter(Boolean);

  const safeDescription = stripHtml(paper.metaDescription) || `Download ${paper.title} from our ${paper.category || 'library'} collection.`;

  return {
    title: `${paper.title} | Free PDF Download`,
    description: safeDescription,
    keywords: keywordsArray,
    openGraph: {
      title: paper.title,
      description: safeDescription,
      type: "article",
      images: paper.coverImageUrl ? [{ url: paper.coverImageUrl }] : [],
    },
  };
}

// 5. The Page Component
export default async function SinglePaperPage({ params }: PageProps) {
  const resolvedParams = await params;
  const paper = await getPaper(resolvedParams.slug);

  if (!paper) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <main className="max-w-4xl mx-auto">
        
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link 
            href="/papers" 
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Library
          </Link>
        </div>

        <article className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Cover Image Hero Section */}
          {paper.coverImageUrl && (
            <div className="relative w-full h-64 sm:h-80 md:h-[420px] bg-gray-100">
              <img 
                src={paper.coverImageUrl} 
                alt={paper.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          )}

          <div className="p-6 sm:p-10 md:p-14">
            
            {/* Category Badge */}
            {paper.category && (
              <div className="flex items-center gap-4 mb-6">
                <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-md border border-blue-100 uppercase tracking-widest">
                  {paper.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.15] mb-6 tracking-tight text-balance">
              {paper.title}
            </h1>

            {/* Lead Description */}
            {paper.metaDescription && (
              <p className="text-xl text-gray-600 leading-relaxed mb-10 font-medium text-balance">
                {stripHtml(paper.metaDescription)}
              </p>
            )}

            {/* Highlighted Downloads Section */}
            {paper.links && paper.links.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 mb-12 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Available Downloads
                </h3>
                
                <div className="flex flex-wrap gap-4">
                  {paper.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-blue-500/20 gap-2.5 text-base w-full sm:w-auto"
                    >
                      {link.label || "Download Resource"}
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Divider (only show if there is full details) */}
            {paper.fullDetails && (
              <hr className="border-gray-100 mb-10" />
            )}

            {/* Rich HTML Content Section */}
            {paper.fullDetails && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
                  Detailed Information
                </h2>
                
                {/* 
                  🔥 THE ULTIMATE FIX: Arbitrary Variants
                  This forces Tailwind to style the raw HTML tags inside this div without needing plugins or globals.css
                */}
                <div 
                  className="
                    text-gray-700 leading-relaxed
                    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-8 [&_h1]:mb-4
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-4
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3
                    [&_p]:mb-4
                    [&_strong]:font-bold [&_strong]:text-gray-900
                    [&_b]:font-bold [&_b]:text-gray-900
                    [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                    [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                    [&_li]:mb-1
                    [&_a]:text-blue-600 [&_a]:hover:underline
                    [&_hr]:my-8 [&_hr]:border-gray-200
                  "
                  dangerouslySetInnerHTML={{ __html: decodeHtml(paper.fullDetails) }} 
                />
              </div>
            )}
            
          </div>
        </article>
        
      </main>
    </div>
  );
}