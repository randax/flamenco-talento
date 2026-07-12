"use client";

import React from "react";
import Image from "next/image";
import { motion } from "@/components/site/Motion";
import { PortableText } from "@/components/site/PortableText";
import { urlFor } from "@/sanity/lib/image";
import type { PedagogBlock } from "@/components/blocks/types";

export function Pedagog({ block }: { block: PedagogBlock }) {
  const teacher = block.teacher;
  const imageUrl = teacher?.image ? urlFor(teacher.image).width(1200).url() : undefined;

  return (
    <section id="pedagog" className="py-24 md:py-32 bg-zinc-900 border-y border-white/5">
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
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
            {block.heading} <span className="text-flamenco-red italic">{block.headingAccent}</span>
          </h2>
          <div className="w-24 h-1 bg-flamenco-red mx-auto mt-6"></div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12 items-center max-w-5xl mx-auto">
          <motion.div
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
              duration: 0.6,
            }}
            className="w-full md:w-2/5"
          >
            <div className="aspect-[3/4] overflow-hidden relative">
              <div className="absolute inset-0 bg-flamenco-red mix-blend-multiply opacity-20 z-10"></div>
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={teacher?.name ?? ""}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="w-full h-full object-cover grayscale"
                />
              )}
            </div>
          </motion.div>

          <motion.div
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
              duration: 0.6,
              delay: 0.2,
            }}
            className="w-full md:w-3/5"
          >
            <h3 className="text-3xl font-serif font-bold text-white mb-2">{teacher?.name}</h3>
            <p className="text-flamenco-red tracking-widest uppercase text-sm font-medium mb-8">
              {teacher?.role}
            </p>

            <div className="space-y-6 text-flamenco-light/80 text-lg leading-relaxed font-light">
              {teacher?.bio && <PortableText value={teacher.bio} />}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
