import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // next-sanity 13's `sanityFetch` unconditionally calls `cacheTag()` and
  // `cacheLife()` (see node_modules/next-sanity/dist/live/conditions/next-js/
  // index.js). Both require Cache Components: `cacheTag()` throws without this
  // flag, and additionally only runs inside a `'use cache'` boundary — hence
  // every `sanityFetch` call site is wrapped in a `'use cache'` helper.
  cacheComponents: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
