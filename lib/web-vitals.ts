import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onTTFB, Metric } from "web-vitals";

export function reportWebVitals(metric: Metric) {
  // Send to analytics service
  console.log("Web Vitals:", metric);

  // You can send to Vercel Analytics, Google Analytics, etc.
  // Example: sendToAnalytics(metric)
}

export function useWebVitals() {
  useEffect(() => {
    // Measure Core Web Vitals
    onCLS(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  }, []);
}
