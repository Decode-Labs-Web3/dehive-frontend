import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,

  // BUILD SPEED OPTIMIZATIONS
  experimental: {
    // Enable optimized package imports for better tree shaking
    optimizePackageImports: [
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "@radix-ui/react-switch",
      "@fortawesome/react-fontawesome",
      "@dnd-kit/core",
      "@dnd-kit/utilities",
    ],
    // Enable scroll restoration for better UX
    scrollRestoration: true,
    // FASTER BUILDS: Enable faster CSS processing
    optimizeCss: true,
    // RUNTIME: Enable Partial Pre-rendering for static pages (disabled due to API route conflicts)
    // cacheComponents: true,
  },

  // IMAGE OPTIMIZATION
  images: {
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // FASTER IMAGES: Enable unoptimized for local development
    unoptimized: process.env.NODE_ENV === "development",
  },

  // BUNDLE OPTIMIZATION
  modularizeImports: {
    "@fortawesome/free-solid-svg-icons": {
      // Use a more compatible transform for FontAwesome
      transform: "@fortawesome/free-solid-svg-icons/{{member}}",
      skipDefaultConversion: true,
    },
    "@radix-ui/react-icons": {
      transform: "@radix-ui/react-icons/{{member}}",
    },
  },

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

    // BUILD SPEED: Enable webpack optimizations
    if (!dev) {
      // Production optimizations
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

  // TURBOPACK CONFIGURATION: Empty config to silence webpack warning
  turbopack: {},
};

export default nextConfig;
