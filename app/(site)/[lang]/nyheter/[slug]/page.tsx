import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";
import { dict } from "@/lib/dictionary";
import { isLang, OG_LOCALE, type Lang } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import { client } from "@/sanity/lib/client";
import { sanityFetch, typeTag } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";
import { NEWS_POST_QUERY, NEWS_SLUGS_QUERY, TRANSLATIONS_QUERY } from "@/sanity/lib/queries";
import { PortableText } from "@/components/site/PortableText";
import { SetAltHref, type AltHref } from "@/components/site/AltHrefContext";
import { formatNewsDate } from "@/lib/newsDate";
import type { ImageDimensions } from "@/components/blocks/types";

type NewsPostDetail = {
  _id: string;
  title: string | null;
  slug: string | null;
  date: string | null;
  excerpt: string | null;
  language: string | null;
  body: PortableTextBlock[] | null;
  coverImage?: (SanityImageSource & { dimensions?: ImageDimensions | null }) | null;
};

type Translation = { language: string | null; slug: string | null };

type NewsSlug = { slug: string; language: string };

// The real Sanity project isn't provisioned yet (placeholder project id in
// sanity/env.ts), so this fetch fails during `next build`. Fall back to an
// empty list so the build stays green — pages render on demand once a real
// project exists.
export async function generateStaticParams() {
  try {
    const posts = await client.fetch<NewsSlug[]>(NEWS_SLUGS_QUERY);
    return posts.map(({ slug, language }) => ({ lang: language, slug }));
  } catch {
    return [];
  }
}

// `'use cache'` boundary (shared by generateMetadata + the page body):
// `sanityFetch` calls `cacheTag()`/`cacheLife()` internally, which require
// Cache Components (see next.config.ts). Args are serializable primitives.
async function fetchPost(slug: string, lang: Lang): Promise<NewsPostDetail | null> {
  "use cache";
  const { data } = (await sanityFetch({
    query: NEWS_POST_QUERY,
    params: { slug, lang },
    tags: [typeTag("newsPost")],
  })) as { data: NewsPostDetail | null };
  return data;
}

// Cached hreflang lookup for generateMetadata. Uses the plain client, so it
// must live in a `'use cache'` boundary to keep generateMetadata static under
// Cache Components (otherwise the uncached fetch makes metadata dynamic while
// the rest of the route is static, which Next rejects).
async function fetchTranslations(id: string): Promise<Translation[]> {
  "use cache";
  return (await client.fetch<Translation[]>(TRANSLATIONS_QUERY, { id })) ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};

  const post = await fetchPost(slug, lang);
  if (!post) return {};

  const url = absoluteUrl(`/${lang}/nyheter/${slug}`);
  const languages: Record<string, string> = { [lang]: url };

  // Map the other-language slug for hreflang alternates via the
  // document-internationalization metadata document.
  for (const tr of await fetchTranslations(post._id)) {
    if (tr.language && tr.slug) {
      languages[tr.language] = absoluteUrl(`/${tr.language}/nyheter/${tr.slug}`);
    }
  }

  const title = `${post.title} | Flamenco Talento`;

  return {
    title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description: post.excerpt ?? undefined,
      url,
      siteName: "Flamenco Talento",
      locale: OG_LOCALE[lang],
      type: "article",
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!isLang(lang)) {
    notFound();
  }

  const post = await fetchPost(slug, lang);
  if (!post) {
    notFound();
  }

  // Per-locale news slugs differ, so publish the translated URLs to the
  // layout-level LanguageSwitcher (a plain prefix swap would 404).
  const altHref: AltHref = {};
  for (const tr of await fetchTranslations(post._id)) {
    if (isLang(tr.language ?? "") && tr.slug) {
      altHref[tr.language as Lang] = `/${tr.language}/nyheter/${tr.slug}`;
    }
  }

  const t = dict(lang);
  const dims = post.coverImage?.dimensions;
  const coverUrl = post.coverImage ? urlFor(post.coverImage).width(1600).url() : undefined;

  return (
    <main>
      <SetAltHref value={altHref} />
      <article className="py-24 md:py-32 relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <Link
              href={`/${lang}/nyheter`}
              className="text-flamenco-red hover:text-white transition-colors inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase mb-12"
            >
              <ChevronLeft size={16} /> {t.backToNews}
            </Link>

            <span className="text-flamenco-red font-medium tracking-widest uppercase text-sm mb-4 block">
              {formatNewsDate(post.date, lang)}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
              {post.title}
            </h1>

            {coverUrl && (
              <Image
                src={coverUrl}
                alt={post.title ?? ""}
                width={dims?.width ?? 1600}
                height={dims?.height ?? 900}
                className="w-full h-auto object-cover mb-12"
              />
            )}

            {post.body && (
              <PortableText
                value={post.body}
                paragraphClassName="text-flamenco-light/80 text-lg mb-6 leading-relaxed font-light"
              />
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
