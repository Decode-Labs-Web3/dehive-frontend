/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://your-domain.com",
  generateRobotsTxt: true,
  // Exclude API routes and private pages
  exclude: ["/api/*", "/admin/*", "/private/*"],
  // Generate sitemap for dynamic routes
  additionalPaths: async () => {
    // Add dynamic server/channel routes if needed
    return [];
  },
  // Transform function for custom sitemap entries
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
