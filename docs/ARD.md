# ARD — Flamenco Talento Website Architecture

- **Status:** Approved (grilling session 2026-07-12)
- **Related:** [PRD](./PRD.md) · [RFC-001](./RFC-001-flamenco-talento-website.md) · [Implementation plan](./superpowers/plans/2026-07-12-flamenco-talento-website.md)

This document records the architecture and the decisions behind it. Each decision lists the alternatives that were considered and why they were rejected.

## 1. System overview

```
                        ┌─────────────────────────────────────────┐
                        │            Next.js app (Vercel)         │
 Visitor ── /no, /en ──▶│  [lang] catch-all ─▶ BlockRenderer      │
                        │  /nyheter, /nyheter/[slug]              │
                        │  /studio  (embedded Sanity Studio)      │
 Editor ── /studio ────▶│  /api/trpc (signup mutation)            │
                        │  /api/draft-mode/enable  (preview)      │
                        │  /api/revalidate  (ISR webhook)         │
                        └──────┬──────────────┬───────────────────┘
                               │ GROQ (CDN,   │ writes (token)
                               │ ISR-cached)  ▼
                        ┌──────▼───────────────────┐   ┌──────────┐
                        │  Sanity (production ds)  │   │  Resend  │
                        │  content + submissions   │   │  email   │
                        └──────────┬───────────────┘   └────▲─────┘
                                   │ publish webhook ────────┘ (from tRPC)
                                   ▼
                            /api/revalidate → revalidateTag
```

**Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS v4, Sanity v3 (embedded Studio, next-sanity v9), @sanity/document-internationalization, tRPC v11 + zod, Resend, framer-motion, lucide-react, pnpm, Vercel.

## 2. Decisions

### AD-1 Page structure: one-pager + real news routes

The landing page is a single scroller matching the design; news posts get real routes (`/[lang]/nyheter`, `/[lang]/nyheter/[slug]`).
**Rejected:** pure one-pager (the design's "Les mer"/"Se alle nyheter" affordances would be dead ends); full multi-page split (diverges from the approved design).

### AD-2 CMS model: page builder with generic pages

A `page` document holds `slug` + an ordered array of section blocks, rendered by a catch-all route. The front page is a `page` flagged `isFrontPage`. Editors can create arbitrary new pages from the same blocks.
**Rejected:** fixed-sections-with-editable-content (simpler and safer, but the owner explicitly wants full layout control in Studio); front-page-only builder (generic pages are nearly free once the builder exists).

### AD-3 Data location: blocks reference top-level documents

Section blocks configure presentation only (headings, intro text, which items). Structured data — `classItem`, `pricingPlan`, `newsPost`, `galleryImage`, `teacher`, `siteSettings` — are top-level document types with their own Studio sections.
**Rationale:** editors manage "a class" where they expect to; data is reusable across pages (news pages require this anyway); blocks stay shallow and friendly.
**Rejected:** data embedded in blocks (deep nesting, no reuse); mixed model (inconsistent editing experience).

### AD-4 Studio hosting: embedded at `/studio`

One repo, one deploy, one URL; enables the same-origin Presentation preview.
**Rejected:** separate Studio app (two deploys/URLs, no benefit at this scale).

### AD-5 Editing UX: Presentation tool + live draft preview

Draft mode via `next-sanity` (`defineLive`, stega encoding) so editors click sections on the real site to edit and see drafts live.
**Rejected:** structured-Studio-only (materially worse editing UX for a page-builder site; the "user friendly" requirement is the core of this project).

### AD-6 i18n: document-level translations, prefix routing

`@sanity/document-internationalization` on `page`, `newsPost`, `classItem`, `pricingPlan`, `teacher`, `siteSettings` (one document per language, linked by `translation.metadata`). `galleryImage` and `submission` are not translated. URLs: `/no/...` and `/en/...`; root redirects on `Accept-Language`.
**Rejected:** field-level translation (clutters page-builder blocks, forbids staggered publishing); `/` = Norwegian with `/en` prefix only (owner chose symmetric prefixes; costs one redirect hop).

### AD-7 Signup: tRPC mutation → Sanity + Resend

One tRPC procedure `signup.submit` (zod-validated). Writes a `submission` document with a server-side token client, then emails via Resend; email failure is logged but does not fail the request (Sanity is the source of truth — QR-4). Spam: hidden honeypot field rejected at the schema level + in-memory per-IP sliding-window rate limiter (soft brake; acceptable that it is per-serverless-instance).
**Rejected:** payments/enrollment (out of scope per PRD); email-only (submissions could be lost); captcha (UX cost disproportionate for a small school site).

### AD-8 Rendering: static + ISR with webhook revalidation

All site routes render statically (`generateStaticParams` for langs, slugs, posts). A Sanity webhook signed with `SANITY_REVALIDATE_SECRET` hits `/api/revalidate`, which calls `revalidateTag` — publishes go live in seconds without deploys or per-request fetches.
**Rejected:** SSR everything (needless latency + Sanity API load); time-based revalidation only (stale windows after publishing).

### AD-9 Hero video: Sanity file asset

Uploaded as a plain file field with poster image fallback. Adequate for one short muted looping clip.
**Rejected:** Mux (paid third-party unjustified at this size); hardcoded file (violates the everything-editable requirement).
**Revisit if:** the school wants long-form video content — switch to `sanity-plugin-mux-input`.

### AD-10 Seed content

An idempotent `scripts/seed.ts` (`createOrReplace` with fixed `_id`s) populates the design's Norwegian content plus authored English translations, uploading the design's media to Sanity assets. Day one equals the mockup.

### AD-11 Hosting: Vercel, but host-agnostic code

Vercel + a new Sanity project (free plan). App logic avoids Vercel-specific APIs so the site stays portable.

### AD-12 Conventions

pnpm; TypeScript with no `any`; Tailwind for all styling; UI microcopy that isn't CMS content (form labels, aria strings) lives in a checked-in two-language dictionary, not in components.

## 3. Content model summary

| Document | Translated | Purpose |
|---|---|---|
| `page` | ✔ | slug, isFrontPage, blocks[], seoDescription |
| `newsPost` | ✔ | title, slug, date, excerpt, featured, coverImage, body (portable text) |
| `classItem` | ✔ | name, day, startTime, endTime, level, sortOrder |
| `pricingPlan` | ✔ | title, price, period, features[], highlighted, highlightLabel, sortOrder |
| `teacher` | ✔ | name, role, image, bio (portable text) |
| `siteSettings` | ✔ | navLinks[], contact info, socials, footer copy |
| `galleryImage` | ✘ | image, alt, size (large/wide/small), sortOrder |
| `submission` | ✘ | name, email, phone, interest, message, createdAt, handled |

Blocks (objects): `heroBlock`, `marqueeBlock`, `aboutBlock`, `pedagogBlock` (→teacher), `timeplanBlock` (→classItem[]), `prisBlock` (→pricingPlan[]), `galleryBlock` (→galleryImage[]), `nyheterBlock` (auto-fetches latest N posts), `signupFormBlock`.

## 4. Security & operational notes

- Secrets server-side only: `SANITY_API_READ_TOKEN` (viewer; draft preview), `SANITY_API_WRITE_TOKEN` (editor; submissions/seed), `RESEND_API_KEY`, `SANITY_REVALIDATE_SECRET`. Public: project id, dataset, API version.
- Webhook requests are signature-verified (`next-sanity/webhook` `parseBody`).
- Submission documents are read-only in Studio except `handled`, so the inbox is an audit trail.
- Studio access = Sanity project membership; `/studio` is excluded from robots.
- Resend sends from `onboarding@resend.dev` until the school's domain is verified in Resend (post-launch task).
