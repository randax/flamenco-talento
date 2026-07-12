"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "@/components/site/Motion";
import { dict } from "@/lib/dictionary";
import type { Lang } from "@/lib/i18n";
import type { NyheterBlock, NewsPost } from "@/components/blocks/types";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatNewsDate(date: string | null | undefined, lang: Lang) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  const formatted = new Intl.DateTimeFormat(lang === "no" ? "nb-NO" : "en-GB", {
    day: "numeric",
    month: "long",
  }).format(parsed);
  // Capitalize the month word to match the design.
  return formatted.replace(/\p{L}+/u, (word) => capitalize(word));
}

export function Nyheter({
  block,
  posts,
  lang,
}: {
  block: NyheterBlock;
  posts: NewsPost[];
  lang: Lang;
}) {
  const t = dict(lang);
  const featured = posts[0];
  const rest = posts.slice(1);
  const hrefFor = (post: NewsPost) => `/${lang}/nyheter/${post.slug?.current ?? ""}`;

  return (
    <section id="nyheter" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
              {block.heading}{" "}
              <span className="text-flamenco-red italic">{block.headingAccent}</span>
            </h2>
          </div>
          <Link
            href={`/${lang}/nyheter`}
            className="text-flamenco-red hover:text-white transition-colors flex items-center gap-2 text-sm font-medium tracking-widest uppercase"
          >
            {block.seeAllLabel} <ChevronRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured News */}
          {featured && (
            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
            >
              <Link
                href={hrefFor(featured)}
                className="bg-flamenco-red p-8 md:p-12 flex flex-col justify-center relative overflow-hidden group cursor-pointer h-full"
              >
                <div className="absolute inset-0 bg-black/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <div className="relative z-10">
                  <span className="text-white/80 font-medium tracking-widest uppercase text-sm mb-4 block">
                    {formatNewsDate(featured.date, lang)}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 leading-tight">
                    {featured.title}
                  </h3>
                  <p className="text-white/90 text-lg mb-8 leading-relaxed">{featured.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-white font-medium tracking-widest uppercase text-sm group-hover:gap-4 transition-all">
                    {t.readMore} <ChevronRight size={16} />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Other News */}
          <div className="flex flex-col gap-8">
            {rest.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                className="h-full"
              >
                <Link
                  href={hrefFor(item)}
                  className="bg-zinc-900/50 border border-white/5 p-8 hover:border-flamenco-red/30 transition-colors group cursor-pointer flex flex-col justify-center h-full"
                >
                  <span className="text-flamenco-red font-medium tracking-widest uppercase text-xs mb-3 block">
                    {formatNewsDate(item.date, lang)}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-flamenco-red transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-flamenco-light/70 text-sm leading-relaxed">{item.excerpt}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
