import type { Lang } from "./i18n";

/**
 * Links editors enter in Sanity: menu items, block buttons. Section anchors
 * (`#om`, also typed as `/#om`) point at the front page so they work from
 * every page, unless `onPage` says that section is rendered on the current
 * page, where `#om` just scrolls. Bare relative paths become absolute in the
 * current language; full URLs, `mailto:` and `tel:` pass through.
 */
export function navHref(
  href: string | null | undefined,
  lang: Lang,
  onPage?: ReadonlySet<string>,
): string {
  const value = (href ?? "").trim().replace(/^\/#/, "#");
  if (!value || value === "#") return `/${lang}`;
  if (value.startsWith("#")) return onPage?.has(value.slice(1)) ? value : `/${lang}${value}`;
  if (value.startsWith("/") || /^[a-z][a-z\d+.-]*:/i.test(value)) return value;
  return `/${lang}/${value}`;
}

// Paths (after the locale) that exist in every language, so swapping the
// locale prefix is always a real page.
const SHARED_PATHS = new Set(["", "/nyheter"]);

/**
 * Target of the language switcher. A page's published translation wins (see
 * AltHrefContext), and the current language stays on the current page.
 * Otherwise swap the locale only on routes every language has. CMS slugs
 * differ per language, so rather than guess a URL that may not exist, send news
 * posts to the news index and other pages to the front page.
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
  if (SHARED_PATHS.has(rest)) return `/${target}${rest}`;
  // A news post without a known translation: the news index is the closest page.
  return rest.startsWith("/nyheter/") ? `/${target}/nyheter` : `/${target}`;
}

/**
 * URL of a CMS page: a front page lives at the locale root (its own slug
 * redirects there), every other page at its slug.
 */
export function pagePath(
  lang: Lang,
  slug: string | null | undefined,
  isFrontPage: boolean | null | undefined,
): string | undefined {
  if (isFrontPage) return `/${lang}`;
  return slug ? `/${lang}/${slug}` : undefined;
}
