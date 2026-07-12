import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dict } from "@/lib/dictionary";
import { isLang, LANGS, type Lang } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/live";
import { NEWS_LIST_QUERY } from "@/sanity/lib/queries";
import { NewsCard } from "@/components/blocks/NewsCard";
import type { NewsPost } from "@/components/blocks/types";

// The /nyheter slug is identical in both locales, so alternates are a plain
// prefix swap.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = dict(lang);
  const title = `${t.newsPageTitle} | Flamenco Talento`;
  const url = absoluteUrl(`/${lang}/nyheter`);
  const languages = Object.fromEntries(
    LANGS.map((l) => [l, absoluteUrl(`/${l}/nyheter`)]),
  );

  return {
    title,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      url,
      siteName: "Flamenco Talento",
      locale: lang === "no" ? "nb_NO" : "en_GB",
      type: "website",
    },
  };
}

async function fetchNewsList(lang: Lang): Promise<NewsPost[]> {
  try {
    const { data } = (await sanityFetch({
      query: NEWS_LIST_QUERY,
      params: { lang },
      tags: ["type:newsPost"],
    })) as { data: NewsPost[] | null };
    return data ?? [];
  } catch {
    // The real Sanity project isn't provisioned yet; keep the build green.
    return [];
  }
}

export default async function NewsListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLang(lang)) {
    notFound();
  }

  const t = dict(lang);
  const posts = await fetchNewsList(lang);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <main>
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-16">
            {t.newsPageHeading}{" "}
            <span className="text-flamenco-red italic">{t.newsPageHeadingAccent}</span>
          </h1>

          {posts.length === 0 ? (
            <p className="text-flamenco-light/70 text-lg">{t.newsEmpty}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featured && <NewsCard post={featured} lang={lang} variant="featured" />}
              <div className="flex flex-col gap-8">
                {rest.map((item) => (
                  <NewsCard key={item._id} post={item} lang={lang} variant="standard" />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
