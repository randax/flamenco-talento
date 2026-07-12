"use client";

import React from "react";
import Image from "next/image";
import { motion } from "@/components/site/Motion";
import { PortableText } from "@/components/site/PortableText";
import { urlFor } from "@/sanity/lib/image";
import type { AboutBlock } from "@/components/blocks/types";

export function About({ block }: { block: AboutBlock }) {
  const dims = block.image?.dimensions;
  const width = dims?.width ?? 1000;
  const height = dims?.height ?? 1200;
  const imageUrl = block.image ? urlFor(block.image).width(1200).url() : undefined;

  return (
    <section id="om" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              margin: "-100px",
            }}
            transition={{
              duration: 0.8,
            }}
            className="relative"
          >
            <div className="absolute -inset-4 border border-flamenco-red/30 translate-x-4 translate-y-4 -z-10"></div>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={block.imageAlt ?? ""}
                width={width}
                height={height}
                className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            )}
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              margin: "-100px",
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
            }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-white">
              {block.heading}{" "}
              <span className="text-flamenco-red italic">{block.headingAccent}</span>
            </h2>
            {block.body && (
              <PortableText
                value={block.body}
                paragraphClassName="text-flamenco-light/80 text-lg mb-6 leading-relaxed"
              />
            )}

            {block.quote && (
              <div className="mt-12 p-8 md:p-10 border-l-4 border-flamenco-red bg-white/5 relative group hover:bg-white/10 transition-colors duration-500">
                <span className="text-8xl text-flamenco-red/20 font-serif absolute -top-2 left-4 leading-none select-none group-hover:text-flamenco-red/30 transition-colors duration-500">
                  &quot;
                </span>
                <p className="text-xl md:text-2xl font-serif italic text-white relative z-10 leading-relaxed">
                  {block.quote}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
