/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://finderight.com',
    generateRobotsTxt: true,
    generateIndexSitemap: true,
    sitemapSize: 5000,

    exclude: [
        '/admin/*',
        '/dashboard/*',
        '/profile',
        '/login',
        '/signup',
        '/search',
        '/server-sitemap.xml',
    ],

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
            'https://finderight.com/server-sitemap.xml',
        ],
    },
};
