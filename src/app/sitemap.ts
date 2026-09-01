import type { MetadataRoute } from "next";

// This is a private, single-user tool for real personal financial data
// (purchase prices, mortgage balances, notes) - see robots.ts, which
// disallows indexing entirely. Deliberately NOT including
// /properties/[id] here even though those are "listing-shaped" pages:
// unlike a public real-estate listing site, each one is someone's private
// deal record, and a sitemap.xml file is often fetched directly regardless
// of robots.txt, so enumerating property URLs would leak the existence,
// count, and IDs of private records to anything that requests this file.
// Only the static, non-sensitive top-level routes are listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/properties/new`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
