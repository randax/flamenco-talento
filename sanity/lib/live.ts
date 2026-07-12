import { defineLive } from "next-sanity/live";
import { client } from "./client";

// SANITY_API_READ_TOKEN is optional in dev/local (no real Sanity project is
// provisioned yet, see .env.local). `defineLive` accepts `serverToken` /
// `browserToken` as `string | false | undefined` — without a token, live
// draft/preview content simply isn't available, but published-content fetches
// and `<SanityLive />` still work.
const token = process.env.SANITY_API_READ_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});

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
