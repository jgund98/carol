import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { works } from "@/lib/works";
import { collections } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const statics = ["", "/collections", "/shop", "/studio", "/commissions", "/about", "/contact", "/exhibitions", "/press", "/surfboards", "/books", "/policies"];
  return [
    ...statics.map((p) => ({ url: `${site.url}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...collections.map((c) => ({ url: `${site.url}/collections/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...works.map((w) => ({ url: `${site.url}/shop/${w.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
