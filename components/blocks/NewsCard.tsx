"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { dict } from "@/lib/dictionary";
import type { Lang } from "@/lib/i18n";
import { formatNewsDate } from "@/lib/newsDate";
import type { NewsPost } from "@/components/blocks/types";

// Shared news card, extracted verbatim from the Nyheter block so the block and
// the /nyheter list page render identical markup. `variant` picks the featured
// (red) card or the standard (dark) card.
export function NewsCard({
  post,
  lang,
  variant,
}: {
  post: NewsPost;
  lang: Lang;
  variant: "featured" | "standard";
}) {
  const t = dict(lang);
  const href = `/${lang}/nyheter/${post.slug?.current ?? ""}`;

  if (variant === "featured") {
    return (
      <Link
        href={href}
        className="bg-flamenco-red p-8 md:p-12 flex flex-col justify-center relative overflow-hidden group cursor-pointer h-full"
      >
        <div className="absolute inset-0 bg-black/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
        <div className="relative z-10">
          <span className="text-white/80 font-medium tracking-widest uppercase text-sm mb-4 block">
            {formatNewsDate(post.date, lang)}
          </span>
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 leading-tight">
            {post.title}
          </h3>
          <p className="text-white/90 text-lg mb-8 leading-relaxed">{post.excerpt}</p>
          <span className="inline-flex items-center gap-2 text-white font-medium tracking-widest uppercase text-sm group-hover:gap-4 transition-all">
            {t.readMore} <ChevronRight size={16} />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="bg-zinc-900/50 border border-white/5 p-8 hover:border-flamenco-red/30 transition-colors group cursor-pointer flex flex-col justify-center h-full"
    >
      <span className="text-flamenco-red font-medium tracking-widest uppercase text-xs mb-3 block">
        {formatNewsDate(post.date, lang)}
      </span>
      <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-flamenco-red transition-colors">
        {post.title}
      </h3>
      <p className="text-flamenco-light/70 text-sm leading-relaxed">{post.excerpt}</p>
    </Link>
  );
}
