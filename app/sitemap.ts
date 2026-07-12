import type { MetadataRoute } from "next";
import { LANGS } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import { client } from "@/sanity/lib/client";
import { NEWS_SLUGS_QUERY, PAGE_SLUGS_QUERY } from "@/sanity/lib/queries";

type Slug = { slug: string | null; language: string | null };

// Sanity fetches are wrapped in try/catch: the real project isn't provisioned
// yet (placeholder project id), so on failure the sitemap still renders the
// static locale roots. Editorial URLs get picked up once a real project exists.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LANGS) {
    entries.push({ url: absoluteUrl(`/${lang}`), changeFrequency: "monthly", priority: 1 });
    entries.push({
      url: absoluteUrl(`/${lang}/nyheter`),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  try {
    const pages = await client.fetch<Slug[]>(PAGE_SLUGS_QUERY);
    for (const { slug, language } of pages) {
      if (!slug || !language || slug === "nyheter") continue;
      entries.push({
        url: absoluteUrl(`/${language}/${slug}`),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch {
    // Placeholder project — skip dynamic page entries.
  }

  try {
    const news = await client.fetch<Slug[]>(NEWS_SLUGS_QUERY);
    for (const { slug, language } of news) {
      if (!slug || !language) continue;
      entries.push({
        url: absoluteUrl(`/${language}/nyheter/${slug}`),
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }
  } catch {
    // Placeholder project — skip dynamic news entries.
  }

  return entries;
}
