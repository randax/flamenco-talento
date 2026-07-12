/**
 * Sanity webhook -> ISR revalidation.
 *
 * DEPLOY NOTE (Task 12 README pickup): a webhook must be created for this
 * project in sanity.io/manage before this route does anything useful:
 *   - URL: `${SITE_URL}/api/revalidate`
 *   - Dataset: production
 *   - Trigger on: Create, Update, Delete (all document types)
 *   - Secret: same value as the `SANITY_REVALIDATE_SECRET` env var set on
 *     the deployment (see .env.example)
 *
 * Why a webhook at all when `defineLive`/`sanityFetch` (sanity/lib/live.ts)
 * already revalidates live via Sanity's real-time Live Content API (SSE)?
 * That mechanism only fires while a `<SanityLive />` client is actually
 * connected to a rendered page. Statically generated pages nobody currently
 * has open won't get their cache invalidated until someone visits — this
 * webhook forces revalidation of the relevant `_type` tag regardless of
 * whether a live client is connected, so the *next* visit is always fresh.
 *
 * Tagging scheme: `sanityFetch` calls in this app pass `tags: [typeTag(type)]`
 * (see sanity/lib/live.ts and the app/(site)/[lang]/**\/page.tsx / layout.tsx
 * call sites) in addition to the automatic per-document `sanity:*` sync tags
 * next-sanity manages for the live SSE mechanism. This route only knows the
 * changed document's `_type` (from the webhook payload), so it revalidates
 * that `type:<_type>` tag — it can't target the opaque internal `sanity:*`
 * sync tags, which are exclusively driven by the live SSE connection.
 *
 * KNOWN GAP: `sanityFetch`'s `cacheTag()`/`cacheLife()` calls (inside
 * next-sanity, called from sanity/lib/live.ts) throw at request time unless
 * BOTH of the following hold — neither does today:
 *   1. `cacheComponents: true` is set in next.config.ts (`cacheTag()` throws
 *      "only available with the `cacheComponents` config" without it), AND
 *   2. every `sanityFetch` call site runs inside a `'use cache'`-annotated
 *      boundary — `cacheTag()` also throws "can only be called inside a
 *      \"use cache\" function" when invoked from a plain request-scoped
 *      render (see next/dist/server/use-cache/cache-tag.js). That means the
 *      catch-all page, the [lang] layout, and the nyheter list + detail
 *      pages must be restructured per next-sanity 13's documented pattern:
 *      resolve dynamic values (params, cookies, draftMode) outside the
 *      boundary, then pass them into a `'use cache'` component that calls
 *      `sanityFetch` — see the CachedPage example in
 *      node_modules/next-sanity/dist/live/conditions/next-js/index.d.ts.
 * This is a pre-existing gap from before this task (not introduced by this
 * route), currently masked because the placeholder Sanity project id makes
 * `client.fetch` throw first, which every call site catches. Once a real
 * Sanity project is connected, both halves must land together (a repo-wide
 * behavioral change needing its own verification pass) or this
 * tagging/revalidation path will throw. Flagging for follow-up, not fixing
 * here.
 */
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { typeTag } from "@/sanity/lib/live";

export async function POST(req: NextRequest) {
  try {
    // Third arg disables parseBody's built-in ~3s "wait for Content Lake
    // eventual consistency" delay — this route never re-queries Sanity (it
    // only revalidates a cache tag), so the wait would be pure latency.
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
      false,
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { revalidated: false, message: "Invalid signature" },
        { status: 401 },
      );
    }

    const type = body?._type;
    if (!type) {
      return NextResponse.json(
        { revalidated: false, message: "Missing _type in payload" },
        { status: 400 },
      );
    }

    // "max" matches the cache profile next-sanity's own live-sync server
    // action uses (next-sanity/dist/live/server-actions) when revalidating
    // sync tags in production.
    revalidateTag(typeTag(type), "max");

    return NextResponse.json({ revalidated: true, type });
  } catch (err) {
    return NextResponse.json(
      { revalidated: false, message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
