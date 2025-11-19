/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: "https://finderight.com",
    generateRobotsTxt: true,
    generateIndexSitemap: true,
    sitemapSize: 5000,
    changefreq: "daily",
    priority: 0.7,

    // ❌ Pages you do NOT want indexed
    exclude: [
        "/admin/*",
        "/dashboard/*",
        "/profile",
        "/login",
        "/signup",
        "/search",
        "/server-sitemap.xml", // prevent duplication
    ],

    // ✔ Include custom dynamic sitemap
    additionalSitemaps: [
        "https://finderight.com/server-sitemap.xml",
    ],

    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/dashboard",
                    "/profile",
                    "/login",
                    "/signup",
                    "/search",
                ],
            },
        ],

        // ✔ Add sitemaps inside robots.txt
        additionalSitemaps: [
            "https://finderight.com/sitemap.xml",
            "https://finderight.com/server-sitemap.xml",
        ],
    },
};
