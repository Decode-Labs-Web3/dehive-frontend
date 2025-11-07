import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false, // Don't auto-open browser
});

export default bundleAnalyzerConfig;
