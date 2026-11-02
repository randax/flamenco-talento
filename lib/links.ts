import type { Lang } from "./i18n";

/**
 * Menu links in siteSettings are section anchors (`#om`, `#kontakt`) on the
 * front page. Point them at the front page explicitly so they also work from
 * other pages; on the front page itself `/no#om` still just scrolls.
 */
export function navHref(href: string | null | undefined, lang: Lang): string {
  if (!href || href === "#") return `/${lang}`;
  return href.startsWith("#") ? `/${lang}${href}` : href;
}

// Paths (after the locale) that exist in every language, so swapping the
// locale prefix is always a real page.
const SHARED_PATHS = new Set(["", "/nyheter"]);

/**
 * Target of the language switcher. A page's published translation wins (see
 * AltHrefContext), and the current language stays on the current page.
 * Otherwise swap the locale only on routes every language
 * has; CMS slugs differ per language, so send those to the front page instead
 * of guessing a URL that may not exist.
 */
export function languageHref(
  pathname: string,
  target: Lang,
  altHref?: Partial<Record<Lang, string>>,
): string {
  if (altHref?.[target]) return altHref[target];
  const [, current = ""] = pathname.split("/");
  if (current === target) return pathname;
  const rest = pathname.replace(/^\/[^/]+/, "").replace(/\/$/, "");
  return SHARED_PATHS.has(rest) ? `/${target}${rest}` : `/${target}`;
}
