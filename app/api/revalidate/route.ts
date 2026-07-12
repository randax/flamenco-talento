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
 * Tagging scheme: `sanityFetch` calls in this app pass a `tags: [\`type:<_type>\`]`
 * option (see app/(site)/[lang]/**\/page.tsx and layout.tsx) in addition to
 * the automatic per-document `sanity:*` sync tags next-sanity manages for
 * the live SSE mechanism. This route only knows the changed document's
 * `_type` (from the webhook payload), so it revalidates that `type:<_type>`
 * tag — it can't target the opaque internal `sanity:*` sync tags, which are
 * exclusively driven by the live SSE connection.
 */
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
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

    // "max" matches the cache profile `sanityFetch` applies via `cacheLife(sanity)`
    // in sanity/lib/live.ts, and the profile next-sanity's own live-sync action uses.
    revalidateTag(`type:${type}`, "max");

    return NextResponse.json({ revalidated: true, type });
  } catch (err) {
    return NextResponse.json(
      { revalidated: false, message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
