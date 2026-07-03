/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://finderight.com",

  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 5000,

  transform: async (config, path) => {
    // Homepage
    if (path === "/") {
      return {
        loc: path,
        changefreq: "always",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    // Main Category Pages
    if (
      path.match(
        /^\/(jobs|study-news|result|admit-card|answer-key|admission|documents)$/
      )
    ) {
      return {
        loc: path,
        changefreq: "hourly",
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // Default pages
    return {
      loc: path,
      changefreq: config.changefreq || "daily",
      priority: config.priority || 0.7,
      lastmod: new Date().toISOString(),
    };
  },

  exclude: [
    "/admin",
    "/admin/*",

    "/dashboard",
    "/dashboard/*",

    "/profile",

    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",

    "/search",

    "/api/*",

    // These are generated separately
    "/jobs-sitemap.xml",
    "/study-news-sitemap.xml",
    "/documents-sitemap.xml",
    "/results-sitemap.xml",
    "/admit-card-sitemap.xml",
    "/answer-key-sitemap.xml",
    "/admission-sitemap.xml",
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",

          "/dashboard",
          "/dashboard/*",

          "/profile",

          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-otp",

          "/search",

          "/api/",

          "/*?*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Googlebot-News",
        allow: "/",
      },
    ],

    additionalSitemaps: [
      "https://finderight.com/jobs-sitemap.xml",
      "https://finderight.com/study-news-sitemap.xml",
      "https://finderight.com/documents-sitemap.xml",
      "https://finderight.com/results-sitemap.xml",
      "https://finderight.com/admit-card-sitemap.xml",
      "https://finderight.com/answer-key-sitemap.xml",
      "https://finderight.com/admission-sitemap.xml",
    ],
  },
};