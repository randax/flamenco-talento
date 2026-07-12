import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer, type PageBlock } from "@/components/blocks/BlockRenderer";
import { isLang, LANGS } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import { client } from "@/sanity/lib/client";
import { sanityFetch, typeTag } from "@/sanity/lib/live";
import { FRONT_PAGE_QUERY, PAGE_QUERY, PAGE_SLUGS_QUERY } from "@/sanity/lib/queries";

type PageData = {
  title: string | null;
  seoDescription: string | null;
  slug: string | null;
  language: string | null;
  blocks: PageBlock[] | null;
};

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

async function fetchPage(
  lang: string,
  joinedSlug: string | undefined,
): Promise<PageData | null> {
  try {
    return await client.fetch<PageData | null>(
      joinedSlug ? PAGE_QUERY : FRONT_PAGE_QUERY,
      joinedSlug ? { slug: joinedSlug, lang } : { lang },
    );
  } catch {
    // The real Sanity project isn't provisioned yet; keep metadata build-safe.
    return null;
  }
}

// Page slugs are assumed identical across locales, so hreflang alternates are a
// symmetric prefix swap (news detail uses TRANSLATIONS_QUERY instead).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang) || slug?.[0] === "nyheter") return {};

  const joinedSlug = slug?.join("/");
  const page = await fetchPage(lang, joinedSlug);
  if (!page) return {};

  const path = joinedSlug ? `/${joinedSlug}` : "";
  const url = absoluteUrl(`/${lang}${path}`);
  const languages = Object.fromEntries(
    LANGS.map((l) => [l, absoluteUrl(`/${l}${path}`)]),
  );
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
      locale: lang === "no" ? "nb_NO" : "en_GB",
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

  const { data: page } = (await sanityFetch({
    query: joinedSlug ? PAGE_QUERY : FRONT_PAGE_QUERY,
    params: joinedSlug ? { slug: joinedSlug, lang } : { lang },
    tags: [typeTag("page")],
  })) as { data: PageData | null };

  if (!page) {
    notFound();
  }

  return (
    <main>
      <BlockRenderer blocks={page.blocks} lang={lang} />
    </main>
  );
}
