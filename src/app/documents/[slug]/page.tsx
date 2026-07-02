import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import { Metadata } from "next";

// 1. DYNAMIC SEO METADATA
// Next.js will run this before rendering the page to inject SEO tags for Google
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetch(`https://finderight.com/api/documents/${slug}`);
  
  if (!res.ok) {
    return { title: "Document Not Found | FindeRight" };
  }

  const doc = await res.json();

  return {
    title: `${doc.title} | FindeRight Services`,
    description: doc.metaDescription || doc.description || `Get details and apply for ${doc.title}`,
    keywords: doc.seoKeywords || doc.category,
  };
}

// 2. PAGE COMPONENT
export default async function DocumentSlugPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  // Next.js automatically caches this fetch, so it won't hit your backend twice 
  // (once for metadata, once for the page) in production!
  const res = await fetch(`https://finderight.com/api/documents/${slug}`, {
    cache: "no-store" 
  });
  
  if (!res.ok) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center mt-10">
        <h1 className="text-2xl font-bold text-gray-800">Document not found</h1>
        <p className="text-gray-500 mt-2">The document you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const doc = await res.json();

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 border rounded-2xl shadow-lg mt-10 bg-white">
      
      {/* Header Section */}
      <div className="border-b border-gray-100 pb-6 mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 leading-tight">
          {doc.title}
        </h1>
        
        {(doc.category || doc.serviceType) && (
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-indigo-600 uppercase bg-indigo-50 w-fit px-3 py-1 rounded-full">
            <FileText className="w-4 h-4" />
            {doc.category ?? "Document"} {doc.serviceType && `— ${doc.serviceType}`}
          </div>
        )}
      </div>
      
      {/* Short Description (Summary) */}
      {doc.description && (
        <p className="text-xl text-slate-600 mb-6 font-medium leading-relaxed">
          {doc.description}
        </p>
      )}

      {/* Full Description / Guide */}
      {doc.fullDescription && (
        <div className="prose prose-lg max-w-none text-slate-700 mb-8 whitespace-pre-wrap">
          {doc.fullDescription}
        </div>
      )}
      
      {/* Call to Action Link */}
      {doc.link && (
        <div className="pt-6 border-t border-gray-100 mt-4">
          <a
            href={doc.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 hover:shadow-md transition-all font-semibold"
          >
            Access Official Service <ExternalLink className="w-5 h-5 ml-2" />
          </a>
          <p className="text-xs text-gray-400 mt-3 text-center md:text-left">
            You will be redirected to the official government portal.
          </p>
        </div>
      )}
    </div>
  );
}