import type { NextConfig } from "next";

const PROD = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,

  // Minimal env exposure to the client at build time
  env: {
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
  },

  // Create a self-contained server bundle (good for PM2/Docker)
  output: "standalone",

  // Keep server bundle lean (no external packages specified)
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compiler: {
    removeConsole: PROD ? { exclude: ["error", "warn"] } : false,
  },

  logging: {
    fetches: { fullUrl: !PROD },
  },
};

export default nextConfig;
