/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://finderight.com',
    generateRobotsTxt: true,
    generateIndexSitemap: true,
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,
    exclude: ['/admin/**', '/dashboard/**'],
};
