"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n";
import { useAltHref } from "@/components/site/AltHrefContext";

// Swaps the locale prefix on the current path. Pages whose translated URL
// differs from a plain prefix swap (e.g. a news post with per-locale slugs)
// publish per-language targets via AltHrefContext (SetAltHref); those win.
export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const altHref = useAltHref();

  const hrefFor = (target: Lang) => {
    if (altHref?.[target]) return altHref[target]!;
    const segments = (pathname ?? `/${lang}`).split("/");
    // segments[0] is "" (leading slash), segments[1] is the current locale.
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase">
      {LANGS.map((target, index) => (
        <React.Fragment key={target}>
          {index > 0 && <span className="text-flamenco-light/30">/</span>}
          <Link
            href={hrefFor(target)}
            className={
              target === lang
                ? "text-white"
                : "text-flamenco-light/80 hover:text-white transition-colors"
            }
          >
            {target.toUpperCase()}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}
