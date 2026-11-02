import { draftMode } from "next/headers";
import { defineLive } from "next-sanity/live";
import { client } from "./client";

// SANITY_API_READ_TOKEN is optional in dev/local (no real Sanity project is
// provisioned yet, see .env.local). `defineLive` accepts `serverToken` /
// `browserToken` as `string | false | undefined` — without a token, live
// draft/preview content simply isn't available, but published-content fetches
// and `<SanityLive />` still work.
const token = process.env.SANITY_API_READ_TOKEN;

const { sanityFetch: liveFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});

export { SanityLive };

type FetchOptions = Omit<Parameters<typeof liveFetch>[0], "perspective" | "stega">;

/**
 * `sanityFetch` that reads drafts while Draft Mode is on (i.e. inside the
 * Presentation tool) and published content otherwise. Call it inside a
 * `'use cache'` boundary: Next lets `draftMode()` be read there, and re-runs
 * cached scopes on every request while Draft Mode is on, so drafts are never
 * cached. Stega (click-to-edit overlays) stays off: it would encode CMS strings
 * the site compares and groups on.
 */
export async function sanityFetch(options: FetchOptions) {
  const { isEnabled } = await draftMode();
  return liveFetch({ ...options, perspective: isEnabled ? "drafts" : "published", stega: false });
}

/**
 * Cache tag for a given document `_type`, applied to `sanityFetch` calls via
 * `tags: [typeTag("page")]` and revalidated by app/api/revalidate/route.ts
 * (which only receives a webhook payload's `_type`, not next-sanity's
 * internal `sanity:*` sync tags). Single source of truth for the `"type:"`
 * prefix so both sides always agree.
 */
export function typeTag(type: string): string {
  return `type:${type}`;
}
