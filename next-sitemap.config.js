/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://finderight.com',
    generateRobotsTxt: true,
    generateIndexSitemap: true,
    sitemapSize: 5000,
    changefreq: 'daily',
    priority: 0.7,

    // Pages Next should NOT include in sitemap
    exclude: [
        '/admin/*',
        '/dashboard/*',
        '/profile',
        '/login',
        '/signup',
        '/search',
        '/server-sitemap.xml', // avoid duplication
    ],

    // Extra dynamic sitemap created manually
    additionalSitemaps: [
        'https://finderight.com/server-sitemap.xml',
    ],

    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin',
                    '/dashboard',
                    '/profile',
                    '/login',
                    '/signup',
                    '/search',
                ],
            },
        ],
        additionalSitemaps: [
            'https://finderight.com/sitemap.xml',
            'https://finderight.com/server-sitemap.xml',
        ],
    },
};
