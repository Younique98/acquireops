import type { MetadataRoute } from "next";

// This is a private tool for personal financial data, not a public site -
// disallow everything rather than the usual AI-crawler-friendly allowlist.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
