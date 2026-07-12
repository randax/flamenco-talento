# RFC-001 — Flamenco Talento: Sanity-driven bilingual website

- **Status:** Accepted 2026-07-12
- **Author:** Øyvind Randa (with Claude)
- **Reviewers:** Øyvind Randa
- **Related:** [PRD](./PRD.md) · [ARD](./ARD.md) · [Implementation plan](./superpowers/plans/2026-07-12-flamenco-talento-website.md)

## Summary

Build the Flamenco Talento website by porting the approved Magic Patterns design (artifact `bq3jgjpcmh218crxjqocdk`) into a Next.js 15 App Router project where **Sanity is the single source of truth for all content and page composition**. Pages are built from nine section blocks in a page-builder; Norwegian and English are separate linked documents under `/no` and `/en` prefixes; signups flow through a tRPC mutation into Sanity with a Resend email notification; the Studio (embedded at `/studio`) offers click-to-edit live preview via the Presentation tool.

## Motivation

The school has an approved design but no way to run a site without a developer. The requirement that shaped everything: *all functionality must be manipulable via Sanity Studio in a user-friendly way*. That rules out hardcoded content, motivates the page builder + referenced-documents split, and justifies the extra investment in live preview.

## Detailed design

### Routing

```
/                                → 307 to /no or /en (Accept-Language)
/{no|en}                         → front page (page with isFrontPage)
/{no|en}/{slug}                  → any builder page (catch-all)
/{no|en}/nyheter                 → news list
/{no|en}/nyheter/{slug}          → news article
/studio                          → embedded Sanity Studio
/api/trpc/*                      → tRPC (signup.submit)
/api/draft-mode/enable           → Presentation preview entry
/api/revalidate                  → signed Sanity webhook → revalidateTag
```

Middleware performs the locale redirect and skips `/studio`, `/api`, `/_next`, and static files. `nyheter` is a reserved slug (static segment wins over the catch-all).

### Content model

See [ARD §3](./ARD.md#3-content-model-summary). The key invariant: **blocks are presentation, documents are data.** A `timeplanBlock` knows its heading and which `classItem`s to show; the class's day/time/level live on the `classItem` and are edited in the "Timeplan" Studio section. GROQ queries expand references inline (`classes[]->`) so the renderer receives plain data.

### Rendering pipeline

`[[...slug]]/page.tsx` → `sanityFetch(PAGE_QUERY)` → `<BlockRenderer>` maps `_type` → section component. Components are the design's JSX verbatim (classNames untouched), converted to accept `{ block, lang }` props; framer-motion sections are client components fed by server data. Images go through `next/image` + Sanity image URLs; the hero video is a Sanity file asset. Static generation + ISR; stega-encoded strings make every element click-to-edit in Presentation (with `stegaClean` applied to values used in logic).

### Signup flow

```
SignupForm (client) → trpc.signup.submit
  zod: name ≥2, email, phone?, interest, message ≤2000?, honeypot(website) = ""
  rate limit: 5/hour per IP (in-memory sliding window)
  → writeClient.create({_type: "submission", ..., handled: false})
  → resend.emails.send(→ SIGNUP_NOTIFICATION_EMAIL)   // failure logged, not fatal
  → { ok: true }
```

The interest `<select>` is populated from the page's own classes and plans. The Studio's "Påmeldinger" section is the inbox (read-only fields + `handled` toggle).

### i18n

Document-level translation via `@sanity/document-internationalization`; `translation.metadata` links language pairs, which also powers the language switcher's slug mapping and `hreflang` alternates. Non-CMS microcopy (form labels, aria strings) lives in `lib/dictionary.ts` with both languages checked in.

## Alternatives considered

Recorded per-decision in the [ARD](./ARD.md); headline rejections: fixed-section CMS model, field-level i18n, Mux video, payment-integrated enrollment, SSR rendering, separate Studio deployment.

## Trade-offs accepted

- **Page builder freedom vs. safety.** Editors can compose odd pages (e.g. two heroes). Mitigation: good block previews/labels in Studio and live preview making mistakes visible before publish; no hard validation on composition.
- **In-memory rate limiting** is per-serverless-instance, so the effective cap is soft. Accepted alongside the honeypot for a small site; escalation path is Upstash/Vercel KV.
- **`/no` prefix + redirect hop** on the root instead of serving Norwegian at `/`. Chosen for symmetry; costs one 307 and slightly weaker root-domain SEO.
- **Document-level i18n duplicates structure** (a schedule change must be made in both `classItem` languages). Accepted for clean per-language publishing; times/prices rarely change.
- **Sanity-hosted video** has no adaptive streaming. Fine for one short muted loop; revisit with Mux if video use grows.

## Rollout

1. Implement per the [implementation plan](./superpowers/plans/2026-07-12-flamenco-talento-website.md) (12 tasks, each independently verified and committed).
2. Seed the dataset with design content (NO + EN).
3. Deploy to Vercel; configure env vars, Sanity CORS origin, the revalidation webhook, and `SANITY_STUDIO_PREVIEW_ORIGIN`.
4. Handover: Norwegian editor guide in the README; school replaces placeholder media/copy at their own pace.

No migration concerns (greenfield). Rollback = revert deploy; content lives safely in Sanity regardless.

## Open questions

1. **Domain**: which domain will the site live on (affects Resend domain verification, `NEXT_PUBLIC_SITE_URL`, webhook URL)?
2. **Resend sender**: use `onboarding@resend.dev` until the school's domain is verified — who owns DNS to add the records?
3. **Real media**: the seed uses the design's Unsplash/demo assets; when will the school's own photos/video arrive?
4. **English copy review**: seed translations are authored by us — does a native/marketing pass happen before or after launch?
5. **Studio access**: which staff emails get Sanity project membership, and with what roles?
