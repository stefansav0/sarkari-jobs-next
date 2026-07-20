import Link from "next/link";
import { connectDB } from "@/lib/db";
import QuestionPaper from "@/lib/models/QuestionPaper";

// Add this line to force Next.js to fetch fresh data on every request
export const dynamic = 'force-dynamic';

export default async function PapersListPage() {
  await connectDB();
  
  // .lean() is crucial here to pass data from Server to Client safely
  const papers = await QuestionPaper.find({}).sort({ createdAt: -1 }).lean();

  return (
    <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Resource Library
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse and download our complete collection of question papers, study materials, and documents.
        </p>
      </div>
      
      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {papers.map((paper: any) => (
          <div 
            key={paper._id.toString()} 
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
          >
            
            {/* Thumbnail / Cover Image Area */}
            <div className="relative h-48 w-full bg-gray-50 overflow-hidden border-b border-gray-100">
              {paper.coverImageUrl ? (
                // Using standard img tag so we don't need to configure next.config.js for external domains
                <img 
                  src={paper.coverImageUrl} 
                  alt={paper.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                // Fallback gradient if the user didn't provide a cover image URL
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              
              {/* Floating Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide border border-blue-100">
                  {paper.category}
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {paper.title}
              </h2>
              
              <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                {paper.metaDescription || "Click to view the full details and download this document."}
              </p>
              
              {/* Spacer to push button to bottom */}
              <div className="mt-auto">
                <Link 
                  href={`/papers/${paper.slug}`}
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-gray-50 text-blue-600 font-semibold rounded-xl border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
            
          </div>
        ))}
      </div>
      
      {/* Empty State Handle */}
      {papers.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No documents found. Check back later!</p>
        </div>
      )}
    </main>
  );
}