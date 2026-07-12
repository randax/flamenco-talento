import React from "react";
import type { Lang } from "@/lib/i18n";
import { sanityFetch } from "@/sanity/lib/live";
import { LATEST_NEWS_QUERY } from "@/sanity/lib/queries";
import { Hero } from "@/components/blocks/Hero";
import { Marquee } from "@/components/blocks/Marquee";
import { About } from "@/components/blocks/About";
import { Pedagog } from "@/components/blocks/Pedagog";
import { Timeplan } from "@/components/blocks/Timeplan";
import { Pris } from "@/components/blocks/Pris";
import { Gallery } from "@/components/blocks/Gallery";
import { Nyheter } from "@/components/blocks/Nyheter";
import { SignupSection } from "@/components/blocks/SignupSection";
import type { NewsPost, NyheterBlock, PageBlock } from "@/components/blocks/types";

export type { PageBlock } from "@/components/blocks/types";

const DEFAULT_NEWS_COUNT = 3;

async function fetchLatestNews(lang: Lang, count: number): Promise<NewsPost[]> {
  try {
    const { data } = (await sanityFetch({
      query: LATEST_NEWS_QUERY,
      params: { lang, count },
    })) as { data: NewsPost[] | null };
    return data ?? [];
  } catch {
    // The real Sanity project isn't provisioned yet; keep the build green.
    return [];
  }
}

export async function BlockRenderer({
  blocks,
  lang,
}: {
  blocks?: PageBlock[] | null;
  lang: Lang;
}) {
  if (!blocks?.length) return null;

  // Nyheter blocks fetch their posts here (server-side), then pass plain data
  // to the client component. Fetch once per nyheter block, keyed by block.
  const newsByKey = new Map<string, NewsPost[]>();
  await Promise.all(
    blocks
      .filter((block): block is NyheterBlock => block._type === "nyheterBlock")
      .map(async (block) => {
        const posts = await fetchLatestNews(lang, block.count ?? DEFAULT_NEWS_COUNT);
        newsByKey.set(block._key, posts);
      }),
  );

  return (
    <>
      {blocks.map((block) => {
        switch (block._type) {
          case "heroBlock":
            return <Hero key={block._key} block={block} />;
          case "marqueeBlock":
            return <Marquee key={block._key} block={block} />;
          case "aboutBlock":
            return <About key={block._key} block={block} />;
          case "pedagogBlock":
            return <Pedagog key={block._key} block={block} />;
          case "timeplanBlock":
            return <Timeplan key={block._key} block={block} />;
          case "prisBlock":
            return <Pris key={block._key} block={block} />;
          case "galleryBlock":
            return <Gallery key={block._key} block={block} />;
          case "nyheterBlock":
            return (
              <Nyheter
                key={block._key}
                block={block}
                posts={newsByKey.get(block._key) ?? []}
                lang={lang}
              />
            );
          case "signupFormBlock":
            return <SignupSection key={block._key} block={block} lang={lang} />;
          default: {
            if (process.env.NODE_ENV !== "production") {
              console.warn(
                `BlockRenderer: unknown block type "${(block as { _type: string })._type}"`,
              );
            }
            return null;
          }
        }
      })}
    </>
  );
}
