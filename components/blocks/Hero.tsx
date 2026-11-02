"use client";

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image, { type ImageLoader } from "next/image";
import { stegaClean } from "next-sanity";
import { motion } from "@/components/site/Motion";
import { hotspotPosition, urlFor } from "@/sanity/lib/image";
import type { HeroBlock, HeroImage } from "@/components/blocks/types";
import { SECTION_ID } from "@/components/blocks/sections";

const SLIDE_S = 6;
const FADE_S = 1.6;
const ZOOM = 1.1;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const noSubscribe = () => () => {};

// The user's reduced-motion preference. Not framer's useReducedMotion: that
// reads the preference during the first render, so the client's first render
// differs from the server's (hydration error). This hydrates as "no
// preference", then updates.
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/** False in the server render and during hydration, true afterwards. */
function useHydrated(): boolean {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

// Full-bleed photos that dissolve into each other, each slowly pushing in
// (Ken Burns), in black and white like the video. Every photo starts at its
// natural size, so the server HTML is the same still frame for everyone. A
// single photo stays still; with reduced motion the hero shows the first
// photo, still.
//
// Each slide lives through one cycle, keyed by its step: mounted as "next"
// (hidden, preloading), then "current" (fades in, pushes in), then "previous"
// (keeps pushing in while it fades out), then unmounted. The slideshow only
// advances once the next photo has loaded; photos that fail to load drop out.
function HeroPhotos({ images }: { images: HeroImage[] }) {
  const reduceMotion = usePrefersReducedMotion();
  const hydrated = useHydrated();
  const [failed, setFailed] = useState<string[]>([]);
  const shown = useMemo(() => images.filter((image) => !failed.includes(image._key)), [images, failed]);
  const n = shown.length;
  const slideshow = n > 1 && !reduceMotion;
  const [step, setStep] = useState(0);
  const loaded = useRef(new Set<string>());

  useEffect(() => {
    if (!slideshow) return;
    const timer = setInterval(
      () => setStep((s) => (loaded.current.has(shown[(s + 1) % n]._key) ? s + 1 : s)),
      SLIDE_S * 1000,
    );
    return () => clearInterval(timer);
  }, [slideshow, shown, n]);

  if (n === 0) return null;
  const currentStep = slideshow ? step : 0;
  const steps = slideshow
    ? [step - 1, step, step + 1].filter((s) => s >= 0 && (s <= step || hydrated))
    : [0];

  return (
    <>
      {steps.map((s) => {
        const image = shown[s % n];
        const role = s === currentStep ? "current" : s < currentStep ? "previous" : "next";
        // Sanity's CDN resizes and picks the format, so Next doesn't re-encode.
        const loader: ImageLoader = ({ width, quality }) =>
          urlFor(image).width(width).quality(quality ?? 75).auto("format").url();
        return (
          <motion.div
            key={`${image._key}-${s}`}
            aria-hidden={role !== "current"}
            className="absolute inset-0"
            initial={{ opacity: role === "current" ? 1 : 0, scale: 1 }}
            animate={{
              opacity: role === "current" ? 1 : 0,
              scale: slideshow && role !== "next" ? ZOOM : 1,
            }}
            transition={{
              opacity: { duration: FADE_S },
              // One steady push across showing and fading out.
              scale:
                !slideshow || role === "next"
                  ? { duration: 0 }
                  : { duration: role === "current" ? SLIDE_S + FADE_S : FADE_S, ease: "linear" },
            }}
          >
            <Image
              loader={loader}
              src={urlFor(image).url()}
              alt={image.alt ?? ""}
              fill
              sizes="100vw"
              loading={s === 0 ? "eager" : "lazy"}
              fetchPriority={s === 0 ? "high" : "auto"}
              onLoad={() => loaded.current.add(image._key)}
              onError={() => setFailed((f) => (f.includes(image._key) ? f : [...f, image._key]))}
              className="object-cover grayscale"
              style={{ objectPosition: hotspotPosition(image) }}
            />
          </motion.div>
        );
      })}
      {slideshow && (
        <div aria-hidden className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {shown.map((image, k) => (
            <span
              key={image._key}
              className={`h-px w-10 transition-colors duration-700 ${k === step % n ? "bg-white" : "bg-white/25"}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function Hero({ block }: { block: HeroBlock }) {
  const posterUrl = block.poster ? urlFor(block.poster).width(1600).url() : undefined;
  // An image whose upload hasn't finished has no asset yet.
  const images = (block.images ?? []).filter((image) => image.asset);

  return (
    <section
      id={SECTION_ID.heroBlock}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Full-bleed photos, or the cinematic video when there are none */}
      <div className="absolute inset-0 z-0 bg-flamenco-dark">
        {images.length > 0 ? (
          <HeroPhotos images={images} />
        ) : (
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
        )}
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
