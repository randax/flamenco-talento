"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n";

// Swaps the locale prefix on the current path. On pages that know a
// translated target (e.g. news detail), pass `altHref` per language.
export function LanguageSwitcher({
  lang,
  altHref,
}: {
  lang: Lang;
  altHref?: Partial<Record<Lang, string>>;
}) {
  const pathname = usePathname();

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
