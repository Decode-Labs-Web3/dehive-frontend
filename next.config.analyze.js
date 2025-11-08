import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

export default bundleAnalyzerConfig;
