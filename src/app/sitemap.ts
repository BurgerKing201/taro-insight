import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://taroinsight.space";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/spread`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/numerology`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/compatibility`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/horoscope`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/oferta`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/cookie`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
  ];
}
