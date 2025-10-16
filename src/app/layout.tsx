// File: src/app/layout.tsx

import "./globals.css";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finderight - Latest Sarkari Jobs, Results, Admit Cards & Answer Keys",
  description:
    "Finderight is your one-stop portal for the latest Sarkari jobs, government exam results, admit cards, and answer keys in India.",
  keywords: [
    "sarkari jobs",
    "government jobs",
    "job alerts",
    "exam results",
    "admit card",
    "answer key",
    "finderight",
    "sarkari result",
    "employment news",
  ],
  authors: [{ name: "Finderight Team", url: "https://finderight.com" }],
  icons: {
    icon: "/Logo1.webp",
  },
  openGraph: {
    title: "Finderight - Govt Job Portal",
    description:
      "Stay updated with the latest Sarkari jobs, results, admit cards, and answer keys on Finderight.",
    url: "https://finderight.com/",
    siteName: "Finderight",
    images: [
      {
        url: "https://finderight.com/Logo1.webp",
        width: 1200,
        height: 630,
        alt: "Finderight Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finderight - Sarkari Job Updates",
    description:
      "One-stop portal for government job listings, exam results, admit cards and more.",
    images: ["https://finderight.com/Logo1.webp"],
  },
  metadataBase: new URL("https://finderight.com"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to third-party domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />

        {/* Canonical link for SEO */}
        <link rel="canonical" href="https://finderight.com/" />

        {/* Favicon and Manifest */}
        <link rel="icon" href="/Logo1.webp" type="image/webp" />
        <link rel="manifest" href="/manifest.json" />

        {/* Structured Data / Schema.org for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Finderight",
              url: "https://finderight.com/",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://finderight.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* ✅ Google AdSense (Directly in head to avoid Next.js warnings) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9348579900264611"
          crossOrigin="anonymous"
        ></script>
      </head>

      <body>
        <header>
          <Navbar />
        </header>

        <main id="main-content" role="main">
          {children}
        </main>

        <footer>
          <Footer />
        </footer>

        {/* ✅ Google Analytics (next/script is fine here) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SLZNW3SGL4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SLZNW3SGL4');
          `}
        </Script>
      </body>
    </html>
  );
}
