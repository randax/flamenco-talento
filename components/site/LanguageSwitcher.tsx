"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n";
import { useAltHref } from "@/components/site/AltHrefContext";
import { languageHref } from "@/lib/links";

// Pages publish their translated URLs via AltHrefContext (SetAltHref). That
// only arrives after hydration, so the server-rendered links (and any page
// without a translation) use `languageHref`'s safe fallback, never a guessed
// slug that may 404.
export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const pathname = usePathname() ?? `/${lang}`;
  const altHref = useAltHref();
  const hrefFor = (target: Lang) => languageHref(pathname, target, altHref);

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
