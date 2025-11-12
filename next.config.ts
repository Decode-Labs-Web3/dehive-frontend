import type { NextConfig } from "next";
import path from "path";

const PROD = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,

  env: {
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
  },

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
  turbopack: {},
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Stub out optional React Native storage used by MetaMask SDK to silence resolution warnings
      "@react-native-async-storage/async-storage": path.resolve(
        __dirname,
        "src/shims/asyncStorage.ts"
      ),
    };
    return config;
  },
};

export default nextConfig;
