import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    // Silence optional React Native storage dependency required by some wallet SDKs on web builds
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": false,
      // Prevent Next.js from trying to bundle Node-only pretty logger used by pino (via WalletConnect)
      // This removes repeated "Can't resolve 'pino-pretty'" warnings and speeds up dev rebuilds
      "pino-pretty": false,
      // Extra safety: these are node-only parts of pino that shouldn't be bundled on the client
      "sonic-boom": false,
      "pino-abstract-transport": false,
    };
    return config;
  },
};

export default nextConfig;
