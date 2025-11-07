import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,

  // 🚀 DEVELOPMENT SPEED OPTIMIZATIONS
  experimental: {
    // ⚡ FASTER DEV: Enable Turbopack filesystem caching for faster rebuilds
    turbopackFileSystemCacheForDev: true,
    // ⚡ FASTER DEV: Reduce optimizePackageImports for development speed
    optimizePackageImports:
      process.env.NODE_ENV === "production"
        ? [
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
            "@radix-ui/react-switch",
            "@fortawesome/react-fontawesome",
            "@dnd-kit/core",
            "@dnd-kit/utilities",
          ]
        : [], // Disable during development for faster compilation
    // Enable scroll restoration for better UX
    scrollRestoration: true,
    // ⚡ FASTER DEV: Disable CSS optimization during development
    optimizeCss: process.env.NODE_ENV === "production", // Only enable in production
    // 🚀 FASTER CSS: Lightning CSS disabled due to PostCSS conflict with Tailwind
  },

  // 🚀 REACT COMPILER: Enable automatic memoization (stable in Next.js 16)
  reactCompiler: true,

  // 🚀 CACHE COMPONENTS: Disabled due to API route conflicts
  // cacheComponents: true, // Uncomment when API routes are updated

  // 🚀 PERFORMANCE OPTIMIZATIONS
  // Enable compiler optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 🚀 OUTPUT OPTIMIZATION
  output: "standalone", // For Docker deployment optimization

  // 🚀 LOGGING OPTIMIZATION
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // IMAGE OPTIMIZATION
  images: {
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // FASTER IMAGES: Enable unoptimized for local development
    unoptimized: process.env.NODE_ENV === "development",
  },

  // 🚀 BUNDLE OPTIMIZATION: Only apply in production for faster dev
  modularizeImports:
    process.env.NODE_ENV === "production"
      ? {
          "@fortawesome/free-solid-svg-icons": {
            transform: "@fortawesome/free-solid-svg-icons/{{member}}",
            skipDefaultConversion: true,
          },
          "@radix-ui/react-icons": {
            transform: "@radix-ui/react-icons/{{member}}",
          },
        }
      : {}, // Disable during development for faster compilation

  webpack: (config, { dev }) => {
    // Silence optional React Native storage dependency required by some wallet SDKs on web builds
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": false,
      // Prevent Next.js from trying to bundle Node-only pretty logger used by pino (via WalletConnect)
      "pino-pretty": false,
      "sonic-boom": false,
      "pino-abstract-transport": false,
    };

    // 🚀 DEVELOPMENT SPEED: Simplify webpack for faster dev compilation
    if (dev) {
      // Development optimizations for speed
      config.optimization = {
        ...config.optimization,
        // ⚡ FASTER DEV: Reduce webpack overhead
        moduleIds: "named", // Faster than 'deterministic' in dev
        chunkIds: "named",
        // ⚡ FASTER DEV: Disable expensive optimizations in development
        splitChunks: false, // Disable chunk splitting for faster rebuilds
      };
      // ⚡ FASTER DEV: Disable source maps processing
      config.devtool = false;
    } else {
      // Production optimizations (unchanged)
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        chunkIds: "deterministic",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: "radix-ui",
              chunks: "all",
            },
            fontawesome: {
              test: /[\\/]node_modules[\\/]@fortawesome[\\/]/,
              name: "fontawesome",
              chunks: "all",
            },
          },
        },
      };
    }

    return config;
  },

  // 🚀 TURBOPACK OPTIMIZATION: Configure for maximum development speed
  turbopack: {
    // ⚡ FASTER DEV: Optimize Turbopack for development
    // Note: Keep config minimal to avoid conflicts
  },
};

export default nextConfig;
