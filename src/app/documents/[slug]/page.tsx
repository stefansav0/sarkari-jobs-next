import React from "react";
import { ExternalLink, FileText, ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

// ----------------------------------------------------------------------
// 1. ADVANCED SEO METADATA GENERATION
// ----------------------------------------------------------------------
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  // Use your actual production domain here
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.finderight.com";
  const pageUrl = `${baseUrl}/documents/${slug}`;

  try {
    const res = await fetch(`${baseUrl}/api/documents/${slug}`);
    if (!res.ok) throw new Error("Not found");
    
    const doc = await res.json();
    const seoTitle = `${doc.title} | FindeRight Document Services`;
    const seoDescription = doc.metaDescription || doc.description || `Get complete details, guides, and official links for ${doc.title}.`;

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: doc.seoKeywords || `${doc.category}, ${doc.serviceType}, online application, government documents`,
      alternates: {
        canonical: pageUrl, // Tells Google this is the master URL for this content
      },
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: pageUrl,
        siteName: "FindeRight",
        type: "article",
        images: doc.coverImageUrl ? [
          {
            url: doc.coverImageUrl,
            width: 1200,
            height: 630,
            alt: doc.title,
          }
        ] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription,
        images: doc.coverImageUrl ? [doc.coverImageUrl] : [],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    return { title: "Document Not Found | FindeRight" };
  }
}

// ----------------------------------------------------------------------
// 2. PAGE COMPONENT
// ----------------------------------------------------------------------
export default async function DocumentSlugPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.finderight.com";

  // Fetch document data
  const res = await fetch(`${baseUrl}/api/documents/${slug}`, {
    cache: "no-store" 
  });
  
  if (!res.ok) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center mt-20">
        <h1 className="text-3xl font-bold text-slate-800">Document not found</h1>
        <p className="text-slate-500 mt-3">The document you are looking for does not exist or has been removed.</p>
        <Link href="/documents" className="inline-flex items-center mt-6 text-blue-600 hover:underline font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Documents
        </Link>
      </div>
    );
  }

  const doc = await res.json();

  // ----------------------------------------------------------------------
  // 3. JSON-LD STRUCTURED DATA (FOR GOOGLE RICH SNIPPETS)
  // ----------------------------------------------------------------------
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": doc.title,
    "description": doc.metaDescription || doc.description,
    "image": doc.coverImageUrl ? [doc.coverImageUrl] : [],
    "datePublished": doc.createdAt || new Date().toISOString(),
    "dateModified": doc.updatedAt || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "FindeRight"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FindeRight",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png` // Replace with your actual logo URL
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/documents/${slug}`
    }
  };

  return (
    <>
      {/* Inject JSON-LD Schema into the DOM safely */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Wrapping the main content in <article> for semantic SEO */}
      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        <Link href="/documents" className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Link>

        <div className="border border-slate-200 rounded-3xl shadow-sm bg-white overflow-hidden">
          
          {/* Cover Image Hero Section */}
          {doc.coverImageUrl && (
            <figure className="w-full h-64 sm:h-80 md:h-96 bg-slate-100 border-b border-slate-200 relative m-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={doc.coverImageUrl} 
                alt={`${doc.title} cover image`} 
                className="w-full h-full object-cover"
              />
            </figure>
          )}

          <div className="p-6 md:p-10">
            {/* Header Section */}
            <header className="border-b border-slate-100 pb-8 mb-8">
              {(doc.category || doc.serviceType) && (
                <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 w-fit px-3.5 py-1.5 rounded-lg mb-4">
                  <FileText className="w-4 h-4" />
                  {doc.category ?? "Document"} {doc.serviceType && `— ${doc.serviceType}`}
                </div>
              )}
              
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                {doc.title}
              </h1>
            </header>
            
            {/* Short Description (Summary) */}
            {doc.description && (
              <section aria-label="Summary">
                <p className="text-xl text-slate-600 mb-10 font-medium leading-relaxed">
                  {doc.description}
                </p>
              </section>
            )}

            {/* Main Content Rendering Logic */}
            {doc.fullDescription && (
              <section aria-label="Document Details" className="mb-12">
                {doc.contentFormat === 'text' ? (
                  <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {doc.fullDescription}
                  </div>
                ) : (
                  <div 
                    className="prose prose-lg prose-blue max-w-none"
                    dangerouslySetInnerHTML={{ __html: doc.fullDescription }}
                  />
                )}
              </section>
            )}
            
            {/* Call to Action Link */}
            {doc.link && (
              <aside className="pt-8 border-t border-slate-100 mt-8">
                <a
                  href={doc.link}
                  target="_blank"
                  rel="noopener noreferrer nofollow" // 'nofollow' is best practice for external outbound service links
                  className="inline-flex items-center justify-center w-full md:w-auto px-8 py-4 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 font-bold"
                >
                  Access Official Service <ExternalLink className="w-5 h-5 ml-2.5" />
                </a>
                <p className="text-sm text-slate-400 mt-4 text-center md:text-left flex items-center justify-center md:justify-start">
                  <span className="w-2 h-2 rounded-full bg-slate-300 mr-2"></span>
                  You will be redirected to the official government portal.
                </p>
              </aside>
            )}
          </div>
        </div>
      </article>
    </>
  );
}