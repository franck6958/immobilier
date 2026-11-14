import type { MetadataRoute } from "next";
import { posts, services } from "@/lib/content";
import { getPublishedProperties } from "@/lib/data/properties";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getPublishedProperties();
  const pages: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/a-propos", priority: 0.7, freq: "monthly" },
    { path: "/services", priority: 0.9, freq: "monthly" },
    { path: "/biens", priority: 1, freq: "weekly" },
    { path: "/temoignages", priority: 0.6, freq: "monthly" },
    { path: "/blog", priority: 0.7, freq: "weekly" },
    { path: "/contact", priority: 0.8, freq: "yearly" },
    { path: "/demande", priority: 0.9, freq: "yearly" },
    { path: "/confidentialite", priority: 0.2, freq: "yearly" },
  ];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p.path}`, changeFrequency: p.freq, priority: p.priority })),
    ...services.map((s) => ({ url: `${site.url}/services/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...properties.map((p) => ({ url: `${site.url}/biens/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
