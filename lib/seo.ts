// Absolute-URL helpers for metadata/SEO. `alternates.languages` and Open Graph
// URLs must be fully qualified, so everything routes through NEXT_PUBLIC_SITE_URL.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
