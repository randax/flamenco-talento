import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer, type PageBlock } from "@/components/blocks/BlockRenderer";
import { SetAltHref, type AltHref } from "@/components/site/AltHrefContext";
import { isLang, OG_LOCALE, type Lang } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import { client } from "@/sanity/lib/client";
import { sanityFetch, typeTag } from "@/sanity/lib/live";
import {
  FRONT_PAGE_QUERY,
  PAGE_QUERY,
  PAGE_SLUGS_QUERY,
  TRANSLATIONS_QUERY,
} from "@/sanity/lib/queries";

type PageData = {
  _id: string;
  title: string | null;
  seoDescription: string | null;
  slug: string | null;
  language: string | null;
  blocks: PageBlock[] | null;
};

type Translation = { language: string | null; slug: string | null };

type PageSlug = { slug: string; language: string };

// The real Sanity project isn't provisioned yet (placeholder project id in
// sanity/env.ts), so this fetch fails during `next build`. Fall back to an
// empty list so the build stays green — pages render on demand and get
// picked up by ISR once a real project exists.
export async function generateStaticParams() {
  try {
    const pages = await client.fetch<PageSlug[]>(PAGE_SLUGS_QUERY);
    return pages
      .filter(({ slug }) => slug !== "nyheter")
      .map(({ slug, language }) => ({ lang: language, slug: [slug] }));
  } catch {
    return [];
  }
}

// Cached data fetch shared by the page body. Dynamic values (params) are
// resolved by the caller and passed in as primitives so this can live inside a
// `'use cache'` boundary — required because `sanityFetch` calls
// `cacheTag()`/`cacheLife()` internally (see next.config.ts cacheComponents).
async function getPage(
  lang: string,
  joinedSlug: string | undefined,
): Promise<PageData | null> {
  "use cache";
  const { data } = (await sanityFetch({
    query: joinedSlug ? PAGE_QUERY : FRONT_PAGE_QUERY,
    params: joinedSlug ? { slug: joinedSlug, lang } : { lang },
    // PAGE_QUERY inline-expands referenced documents (see BLOCKS_PROJECTION in
    // sanity/lib/queries.ts), so publishing any of those must also invalidate
    // this page. Tag every type the query can pull in — the revalidate webhook
    // (app/api/revalidate/route.ts) only knows the changed document's `_type`.
    tags: [
      typeTag("page"),
      typeTag("classItem"),
      typeTag("pricingPlan"),
      typeTag("teacher"),
      typeTag("galleryImage"),
    ],
  })) as { data: PageData | null };
  return data;
}

// Cached hreflang/language lookup. Uses the plain client, so it must live in a
// `'use cache'` boundary to keep generateMetadata static under Cache Components.
async function fetchTranslations(id: string): Promise<Translation[]> {
  "use cache";
  return (await client.fetch<Translation[]>(TRANSLATIONS_QUERY, { id })) ?? [];
}

// Maps each existing translation to its URL. Front-page translations serve at
// the locale root (`/en`), not at their own slug (`/en/home`); sub-pages use
// the translated slug. Only languages that actually have a translation are
// included, so hreflang alternates are never emitted for non-existent pages.
async function translatedUrls(
  pageId: string,
  isFrontPage: boolean,
): Promise<Partial<Record<Lang, string>>> {
  const urls: Partial<Record<Lang, string>> = {};
  for (const tr of await fetchTranslations(pageId)) {
    if (!isLang(tr.language ?? "")) continue;
    if (isFrontPage) {
      urls[tr.language as Lang] = `/${tr.language}`;
    } else if (tr.slug) {
      urls[tr.language as Lang] = `/${tr.language}/${tr.slug}`;
    }
  }
  return urls;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang) || slug?.[0] === "nyheter") return {};

  const joinedSlug = slug?.join("/");
  const page = await getPage(lang, joinedSlug);
  if (!page) return {};

  const path = joinedSlug ? `/${joinedSlug}` : "";
  const url = absoluteUrl(`/${lang}${path}`);

  // Only advertise hreflang alternates for languages that actually have a
  // translated page, resolved via the document-internationalization metadata.
  const languages: Record<string, string> = { [lang]: url };
  const alts = await translatedUrls(page._id, !joinedSlug);
  for (const [l, p] of Object.entries(alts)) {
    languages[l] = absoluteUrl(p);
  }

  const title = `${page.title} | Flamenco Talento`;

  return {
    title,
    description: page.seoDescription ?? undefined,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description: page.seoDescription ?? undefined,
      url,
      siteName: "Flamenco Talento",
      locale: OG_LOCALE[lang],
      type: "website",
    },
  };
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}) {
  const { lang, slug } = await params;

  if (!isLang(lang)) {
    notFound();
  }

  // Reserved for the static /nyheter route (Task 9) — the catch-all must not
  // shadow it, even though Next already prefers static segments over
  // optional catch-alls.
  if (slug?.[0] === "nyheter") {
    notFound();
  }

  const joinedSlug = slug?.join("/");
  const page = await getPage(lang, joinedSlug);

  if (!page) {
    notFound();
  }

  // Publish translated targets to the layout-level LanguageSwitcher so it points
  // at real translated slugs instead of a blind prefix swap.
  const altHref: AltHref = await translatedUrls(page._id, !joinedSlug);

  return (
    <main>
      <SetAltHref value={altHref} />
      <BlockRenderer blocks={page.blocks} lang={lang} />
    </main>
  );
}
