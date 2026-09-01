import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://acquireops.io/", changeFrequency: "monthly", priority: 1 },
    { url: "https://acquireops.io/signup", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://acquireops.io/login", changeFrequency: "monthly", priority: 0.3 },
  ];
}
