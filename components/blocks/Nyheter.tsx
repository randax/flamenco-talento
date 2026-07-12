"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "@/components/site/Motion";
import { NewsCard } from "@/components/blocks/NewsCard";
import type { Lang } from "@/lib/i18n";
import type { NyheterBlock, NewsPost } from "@/components/blocks/types";

export function Nyheter({
  block,
  posts,
  lang,
}: {
  block: NyheterBlock;
  posts: NewsPost[];
  lang: Lang;
}) {
  const featured = posts[0];
  const rest = posts.slice(1);

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
              <NewsCard post={featured} lang={lang} variant="featured" />
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
                <NewsCard post={item} lang={lang} variant="standard" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
