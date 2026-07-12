import React from "react";
import type { Lang } from "@/lib/i18n";
import { sanityFetch, typeTag } from "@/sanity/lib/live";
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
import type {
  NewsPost,
  NyheterBlock,
  PageBlock,
  PrisBlock,
  TimeplanBlock,
} from "@/components/blocks/types";

export type { PageBlock } from "@/components/blocks/types";

const DEFAULT_NEWS_COUNT = 3;

function deriveInterestOptions(blocks: PageBlock[]): string[] {
  const timeplan = blocks.find(
    (block): block is TimeplanBlock => block._type === "timeplanBlock",
  );
  const pris = blocks.find((block): block is PrisBlock => block._type === "prisBlock");

  const classNames = (timeplan?.classes ?? [])
    .map((c) => c.name)
    .filter((name): name is string => Boolean(name));
  const planTitles = (pris?.plans ?? [])
    .map((p) => p.title)
    .filter((title): title is string => Boolean(title));

  return Array.from(new Set([...classNames, ...planTitles]));
}

// `'use cache'` boundary: `sanityFetch` calls `cacheTag()`/`cacheLife()`
// internally, which require Cache Components (see next.config.ts). Args are
// serializable primitives resolved by the caller.
async function fetchLatestNews(lang: Lang, count: number): Promise<NewsPost[]> {
  "use cache";
  const { data } = (await sanityFetch({
    query: LATEST_NEWS_QUERY,
    params: { lang, count },
    tags: [typeTag("newsPost")],
  })) as { data: NewsPost[] | null };
  return data ?? [];
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

  // The signup form's "interest" select is populated from this same page's
  // own class names (timeplanBlock) and plan titles (prisBlock), so editors
  // don't maintain the list twice. Empty if the page has neither block.
  const interestOptions = deriveInterestOptions(blocks);

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
            return (
              <SignupSection
                key={block._key}
                block={block}
                lang={lang}
                interestOptions={interestOptions}
              />
            );
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
