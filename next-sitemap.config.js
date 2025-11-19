/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://finderight.com',
    generateRobotsTxt: true,
    generateIndexSitemap: true,
    sitemapSize: 5000,
    changefreq: 'daily',
    priority: 0.7,

    // Do NOT index private pages
    exclude: [
        '/admin/*',
        '/dashboard/*',
        '/profile',
        '/login',
        '/signup',
        '/search',
    ],

    // Add our dynamic sitemap file
    additionalSitemaps: [
        'https://finderight.com/server-sitemap.xml',
    ],

    // Robots.txt rules
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/dashboard', '/profile', '/login', '/signup', '/search'],
            },
        ],
    },
};
