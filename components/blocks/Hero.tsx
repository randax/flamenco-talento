"use client";

import React from "react";
import { stegaClean } from "next-sanity";
import { motion } from "@/components/site/Motion";
import { urlFor } from "@/sanity/lib/image";
import type { HeroBlock } from "@/components/blocks/types";

export function Hero({ block }: { block: HeroBlock }) {
  const posterUrl = block.poster ? urlFor(block.poster).width(1600).url() : undefined;

  return (
    <section
      id="hjem"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Full-bleed cinematic video */}
      <div className="absolute inset-0 z-0">
        <motion.video
          initial={{
            scale: 1.08,
          }}
          animate={{
            scale: 1,
          }}
          transition={{
            duration: 1.6,
            ease: "easeOut",
          }}
          src={block.videoUrl ?? undefined}
          poster={posterUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center grayscale"
        />
        {/* Even cinematic scrim for legibility */}
        <div className="absolute inset-0 bg-flamenco-dark/50"></div>
        {/* Subtle top & bottom anchoring so text always reads */}
        <div className="absolute inset-0 bg-gradient-to-b from-flamenco-dark/40 via-transparent to-flamenco-dark/40"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-12 text-center flex flex-col items-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
            delay: 0.2,
          }}
        >
          <span className="text-flamenco-red font-medium tracking-[0.3em] uppercase text-sm md:text-base mb-6 block">
            {block.eyebrow}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-bold text-white mb-6 leading-none">
            {block.headingLine1} <br />
            <span className="text-flamenco-red italic font-light">{block.headingLine2}</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 1,
            delay: 0.8,
          }}
          className="max-w-2xl text-lg md:text-xl text-flamenco-light/80 font-light mb-12"
        >
          {block.tagline}
        </motion.p>

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
            delay: 1.2,
          }}
          className="flex flex-col sm:flex-row gap-6"
        >
          {block.primaryCta?.label && (
            <a
              href={stegaClean(block.primaryCta.href) ?? "#"}
              className="px-8 py-4 bg-flamenco-red text-white font-medium tracking-widest uppercase transition-all duration-300 hover:bg-red-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/50"
            >
              {block.primaryCta.label}
            </a>
          )}
          {block.secondaryCta?.label && (
            <a
              href={stegaClean(block.secondaryCta.href) ?? "#"}
              className="px-8 py-4 border border-white/30 text-white font-medium tracking-widest uppercase transition-all duration-300 hover:bg-white hover:text-flamenco-dark hover:-translate-y-1 hover:shadow-lg hover:shadow-white/10"
            >
              {block.secondaryCta.label}
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
