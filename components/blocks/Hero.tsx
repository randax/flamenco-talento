"use client";

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import Image, { type ImageLoader } from "next/image";
import { Pause, Play } from "lucide-react";
import { stegaClean } from "next-sanity";
import { motion } from "@/components/site/Motion";
import { hotspotPosition, urlFor } from "@/sanity/lib/image";
import type { HeroBlock, HeroImage } from "@/components/blocks/types";
import { SECTION_ID } from "@/components/blocks/sections";
import { initialSlideshow, nextSlide, slideId, slideshowReducer, type Slide } from "@/components/blocks/heroSlideshow";
import { dict } from "@/lib/dictionary";
import type { Lang } from "@/lib/i18n";

const SLIDE_S = 6;
const FADE_S = 1.6;
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

const assetId = (image: HeroImage) => ("_ref" in image.asset ? image.asset._ref : image.asset._id);

// `sizes` for a photo that covers the full-screen hero. On screens narrower
// than the photo's (cropped) aspect ratio, object-cover scales it to the
// screen's height, so it renders wider than the viewport; asking for 100vw
// there would download a photo far too small and make it soft.
function coverSizes(image: HeroImage): string {
  const [w, h] = assetId(image).match(/-(\d+)x(\d+)-/)?.slice(1).map(Number) ?? [];
  if (!w || !h) return "100vw";
  const crop = image.crop;
  const ratio = (w * (1 - (crop?.left ?? 0) - (crop?.right ?? 0))) / (h * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0)));
  return `(max-aspect-ratio: ${Math.round(ratio * 1000)}/1000) ${Math.ceil(ratio * 100)}vh, 100vw`;
}

/** False in the server render and during hydration, true afterwards. */
function useHydrated(): boolean {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

// Full-bleed photos that dissolve into each other, each slowly pushing in
// (Ken Burns), in black and white like the video. Every photo starts at its
// natural size, so the server HTML is the same still frame for everyone. One
// photo, or reduced motion, shows the first photo still. Visitors can pause.
//
// Each slide lives one cycle: mounted as "next" (hidden, preloading), then
// "current" (fades in, pushes in), then "previous" (keeps pushing in while it
// fades out). The slideshow advances only once the next photo has loaded; the
// push-in pauses while it waits, so there is zoom left for the fade. Fades and
// push-in are CSS animations so pausing freezes both. The rules live in
// heroSlideshow.ts.
function HeroPhotos({ images, lang, onAllFailed }: { images: HeroImage[]; lang: Lang; onAllFailed: () => void }) {
  const t = dict(lang);
  const reduceMotion = usePrefersReducedMotion();
  const hydrated = useHydrated();
  const [state, dispatch] = useReducer(slideshowReducer, images, initialSlideshow);
  const { paused } = state;
  const visible = images.filter((image) => !state.failed.includes(image._key));
  // Decided by the photos configured, not those still loading fine, so a
  // failure mid-run stays under the slideshow's rules (pause, readiness).
  const slideshow = images.length > 1 && !reduceMotion;
  const allFailed = visible.length === 0;

  // Switch to the video only while playing: a visitor who paused keeps the
  // (now empty) hero and its play button, and gets the video on resume.
  const fallBack = allFailed && !paused;
  useEffect(() => {
    if (fallBack) onAllFailed();
  }, [fallBack, onAllFailed]);

  // Time left before the next advance; kept across pauses and across the
  // effect re-running (e.g. returning to a page Next kept in the background).
  // Only a new current photo starts a fresh six seconds.
  const remaining = useRef(SLIDE_S * 1000);
  const seq = state.current.seq;
  const { waiting } = state;
  const timedSeq = useRef(seq);
  useEffect(() => {
    if (!slideshow || paused || waiting) return;
    if (timedSeq.current !== seq) {
      timedSeq.current = seq;
      remaining.current = SLIDE_S * 1000;
    }
    const started = performance.now();
    const timer = setTimeout(() => dispatch({ type: "tick", photos: images }), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [slideshow, paused, waiting, seq, images]);

  if (fallBack) return null;
  const next = slideshow && hydrated && !allFailed ? nextSlide(state, images) : null;
  const slides: { slide: Slide; role: "previous" | "current" | "next" }[] = allFailed
    ? []
    : slideshow
      ? [
          ...(state.previous ? [{ slide: state.previous, role: "previous" as const }] : []),
          { slide: state.current, role: "current" as const },
          ...(next ? [{ slide: next, role: "next" as const }] : []),
        ]
      : // Still: the first working photo, or while paused the one showing,
        // so nothing changes until the visitor resumes.
        [{ slide: paused ? state.current : { key: visible[0]._key, seq: 0 }, role: "current" }];

  return (
    <>
      {slides.map(({ slide, role }) => {
        const image = images.find((i) => i._key === slide.key);
        if (!image) return null;
        const id = slideId(slide);
        // Sanity's CDN resizes and picks the format, so Next doesn't re-encode.
        const loader: ImageLoader = ({ width, quality }) =>
          urlFor(image).width(width).quality(quality ?? 75).auto("format").url();
        // Starts with the timer (after hydration), so the zoom and the
        // crossfade stay in step.
        const pushing = slideshow && hydrated && role !== "next";
        return (
          <div
            key={id}
            aria-hidden={role !== "current"}
            className="absolute inset-0"
            style={{
              opacity: role === "next" ? 0 : undefined,
              // The first photo is in the server HTML, already showing.
              animation:
                role === "previous"
                  ? `hero-fade-out ${FADE_S}s linear forwards`
                  : role === "current" && slide.seq > 0
                    ? `hero-fade-in ${FADE_S}s linear forwards`
                    : undefined,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            <div
              className="absolute inset-0"
              style={
                pushing
                  ? {
                      animation: `hero-push ${SLIDE_S + FADE_S}s linear forwards`,
                      animationPlayState: paused || (role === "current" && state.waiting) ? "paused" : "running",
                    }
                  : undefined
              }
            >
              <Image
                loader={loader}
                src={urlFor(image).url()}
                alt={image.alt ?? ""}
                fill
                sizes={coverSizes(image)}
                loading={slide.seq === 0 ? "eager" : "lazy"}
                fetchPriority={slide.seq === 0 ? "high" : "auto"}
                // A photo that broke before hydration still reports onLoad,
                // so check that it actually has pixels.
                onLoad={(e) =>
                  e.currentTarget.naturalWidth > 0
                    ? dispatch({ type: "loaded", id, photos: images })
                    : dispatch({ type: "failed", key: image._key, photos: images })
                }
                onError={() => dispatch({ type: "failed", key: image._key, photos: images })}
                className="object-cover grayscale"
                style={{ objectPosition: hotspotPosition(image) }}
              />
            </div>
          </div>
        );
      })}
      {/* Shown whenever paused too, so a visitor can always resume (even if
          reduced motion was switched on meanwhile). */}
      {(slideshow || paused) && (
        // Above the hero's text (z-20 vs z-10) so it stays clickable on short
        // screens, and inside its width so many photos never push it off.
        <div className="absolute bottom-8 inset-x-6 z-20 flex items-center justify-center gap-4">
          <div aria-hidden className="flex min-w-0 gap-2">
            {(slideshow ? visible : []).map((image) => (
              <span
                key={image._key}
                className={`h-px w-10 min-w-1 transition-colors duration-700 ${image._key === state.current.key ? "bg-white" : "bg-white/25"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => dispatch(paused ? { type: "resume", photos: images } : { type: "pause" })}
            aria-label={paused ? t.playSlideshow : t.pauseSlideshow}
            className="shrink-0 p-1.5 text-white/60 hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white transition-colors"
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </div>
      )}
    </>
  );
}

// The photos, or the video when there are none or none of them load.
function HeroBackground({
  images,
  lang,
  videoUrl,
  posterUrl,
}: {
  images: HeroImage[];
  lang: Lang;
  videoUrl?: string;
  posterUrl?: string;
}) {
  const [photosFailed, setPhotosFailed] = useState(false);
  const onAllFailed = useCallback(() => setPhotosFailed(true), []);
  if (images.length > 0 && !photosFailed) {
    return <HeroPhotos images={images} lang={lang} onAllFailed={onAllFailed} />;
  }
  return (
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
      src={videoUrl}
      poster={posterUrl}
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover object-center grayscale"
    />
  );
}

export function Hero({ block, lang }: { block: HeroBlock; lang: Lang }) {
  const posterUrl = block.poster ? urlFor(block.poster).width(1600).url() : undefined;
  // An image whose upload hasn't finished has no asset yet. Memoised so live
  // content refreshes don't restart the slideshow timer.
  const images = useMemo(() => (block.images ?? []).filter((image) => image.asset), [block.images]);
  // Which photos these are. Keying the background on it means a new set (an
  // editor swapping photos in a live refresh) starts afresh, including
  // retrying a set that failed before.
  const photoSet = images.map((image) => `${image._key}:${assetId(image)}`).join(",");

  return (
    <section
      id={SECTION_ID.heroBlock}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Full-bleed photos, or the cinematic video. No z-index here, so the
          slideshow controls inside can sit above the text. */}
      <div className="absolute inset-0 bg-flamenco-dark">
        <HeroBackground
          key={photoSet}
          images={images}
          lang={lang}
          videoUrl={block.videoUrl ?? undefined}
          posterUrl={posterUrl}
        />
        {/* Even cinematic scrim for legibility */}
        <div className="absolute inset-0 bg-flamenco-dark/50"></div>
        {/* Subtle top & bottom anchoring so text always reads */}
        <div className="absolute inset-0 bg-gradient-to-b from-flamenco-dark/40 via-transparent to-flamenco-dark/40"></div>
      </div>

      {/* pb-16 keeps the buttons clear of the slideshow controls. */}
      <div className="container relative z-10 mx-auto px-6 md:px-12 pb-16 text-center flex flex-col items-center">
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
