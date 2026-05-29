"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!["CLS", "FCP", "INP", "LCP", "TTFB"].includes(metric.name)) {
      return;
    }

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: "rating" in metric ? metric.rating : undefined,
      path: window.location.pathname,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/web-vitals", new Blob([body], { type: "application/json" }));
      return;
    }

    void fetch("/api/analytics/web-vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  });

  return null;
}
