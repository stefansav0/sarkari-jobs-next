import { getServerSideSitemapLegacy } from "next-sitemap";

const getBaseUrl = (req) => {
    // If running locally → use localhost
    if (req.headers.host.includes("localhost")) {
        return `http://${req.headers.host}`;
    }

    // If deployed → use your domain
    return "https://finderight.com";
};

// Safe fetch helper
async function safeFetch(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : [];
    } catch {
        return [];
    }
}

export const getServerSideProps = async (ctx) => {
    const baseUrl = getBaseUrl(ctx.req);

    try {
        const jobs = await safeFetch(`${baseUrl}/api/jobs`);
        const admitCards = await safeFetch(`${baseUrl}/api/admit-cards`);
        const results = await safeFetch(`${baseUrl}/api/results`);
        const answerKeys = await safeFetch(`${baseUrl}/api/answer-keys`);
        const admissions = await safeFetch(`${baseUrl}/api/admissions`);

        const fields = [];

        jobs.forEach((item) => {
            fields.push({
                loc: `${baseUrl}/jobs/${item.slug}`,
                lastmod: new Date(item.updatedAt || item.createdAt || Date.now()).toISOString(),
            });
        });

        admitCards.forEach((item) => {
            fields.push({
                loc: `${baseUrl}/admit-card/${item.slug}`,
                lastmod: new Date(item.updatedAt || item.createdAt || Date.now()).toISOString(),
            });
        });

        results.forEach((item) => {
            fields.push({
                loc: `${baseUrl}/results/${item.slug}`,
                lastmod: new Date(item.updatedAt || item.createdAt || Date.now()).toISOString(),
            });
        });

        answerKeys.forEach((item) => {
            fields.push({
                loc: `${baseUrl}/answer-key/${item.slug}`,
                lastmod: new Date(item.updatedAt || item.createdAt || Date.now()).toISOString(),
            });
        });

        admissions.forEach((item) => {
            fields.push({
                loc: `${baseUrl}/admission/${item.slug}`,
                lastmod: new Date(item.updatedAt || item.createdAt || Date.now()).toISOString(),
            });
        });

        return getServerSideSitemapLegacy(ctx, fields);
    } catch (err) {
        console.error("Sitemap generation failed:", err);
        return getServerSideSitemapLegacy(ctx, []);
    }
};

export default function Sitemap() {
    return null;
}
