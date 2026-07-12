"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

export type AltHref = Partial<Record<Lang, string>>;

// The Header (and its LanguageSwitcher) render in the [lang] layout, but only a
// page knows whether a translated URL differs from a plain prefix swap (e.g. a
// news post whose slug differs across locales). This context lets a page publish
// per-language target URLs up to the layout-level switcher without restructuring
// the layout.
type AltHrefContextValue = {
  altHref?: AltHref;
  setAltHref: (value?: AltHref) => void;
};

const AltHrefContext = createContext<AltHrefContextValue>({
  setAltHref: () => {},
});

export function useAltHref(): AltHref | undefined {
  return useContext(AltHrefContext).altHref;
}

export function AltHrefProvider({ children }: { children: React.ReactNode }) {
  const [altHref, setAltHref] = useState<AltHref>();
  return (
    <AltHrefContext.Provider value={{ altHref, setAltHref }}>
      {children}
    </AltHrefContext.Provider>
  );
}

// Rendered by a page to register its translated language targets with the
// layout-level LanguageSwitcher. Clears them on navigation away so a stale map
// never leaks onto the next page.
export function SetAltHref({ value }: { value: AltHref }) {
  const { setAltHref } = useContext(AltHrefContext);
  const key = JSON.stringify(value);
  useEffect(() => {
    setAltHref(value);
    return () => setAltHref(undefined);
    // `key` captures the meaningful content of `value`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setAltHref]);
  return null;
}
