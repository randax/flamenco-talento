import { notFound } from "next/navigation";
import { BlockRenderer, type PageBlock } from "@/components/blocks/BlockRenderer";
import { isLang } from "@/lib/i18n";
import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
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
