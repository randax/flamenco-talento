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
