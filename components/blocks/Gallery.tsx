"use client";

import React from "react";
import Image from "next/image";
import { stegaClean } from "next-sanity";
import { motion } from "@/components/site/Motion";
import { urlFor } from "@/sanity/lib/image";
import type { GalleryBlock, GalleryImage } from "@/components/blocks/types";

const SIZE_CLASSES: Record<NonNullable<GalleryImage["size"]>, string> = {
  large: "col-span-1 md:col-span-2 row-span-2",
  wide: "col-span-1 md:col-span-2 row-span-1",
  small: "col-span-1 row-span-1",
};

export function Gallery({ block }: { block: GalleryBlock }) {
  const images = block.images ?? [];

  return (
    <section id="galleri" className="py-24 md:py-32 relative bg-zinc-950">
      {/* Abstract background art */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-flamenco-red/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-72 h-72 bg-flamenco-red/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
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
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
            {block.heading} <span className="text-flamenco-red italic">{block.headingAccent}</span>
          </h2>
          <p className="mt-6 text-flamenco-light/70 max-w-2xl mx-auto">{block.intro}</p>
          <div className="w-24 h-1 bg-flamenco-red mx-auto mt-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px] max-w-6xl mx-auto">
          {images.map((img, index) => {
            const url = img.image ? urlFor(img.image).width(1200).url() : undefined;
            return (
              <motion.div
                key={img._id}
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                }}
                className={`relative overflow-hidden group ${SIZE_CLASSES[stegaClean(img.size) ?? "small"]}`}
              >
                <div className="absolute inset-0 bg-flamenco-red/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                {url && (
                  <Image
                    src={url}
                    alt={img.alt ?? ""}
                    fill
                    sizes="(min-width: 768px) 66vw, 100vw"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
