# Flamenco Talento Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Flamenco Talento dance-school website from the Magic Patterns design as a Sanity-driven, bilingual (no/en) Next.js site where editors control everything through a page-builder Studio with live preview, and signups flow through tRPC into Sanity + Resend email.

**Architecture:** Next.js App Router site with locale-prefixed routes (`/no`, `/en`), a generic `page` document rendered by a catch-all route through a block-renderer (page builder). Section blocks configure presentation; structured data (classes, prices, news, gallery, teacher) lives in top-level referenced documents. Sanity Studio is embedded at `/studio` with the Presentation tool for click-to-edit live preview. Content is statically rendered with ISR, revalidated by a Sanity webhook. tRPC serves one mutation: signup submission → Sanity document + Resend email.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS v4, next-sanity v9+, Sanity Studio v3 (embedded), @sanity/document-internationalization, tRPC v11 + zod, Resend, framer-motion, lucide-react, pnpm.

## Global Constraints

- Package manager: **pnpm** (never npm/yarn).
- TypeScript everywhere; **never `any`** unless 100% necessary.
- All copy is Norwegian (default, from the design) + English translations. Language codes: `no`, `en`. URL scheme: `/no/...` and `/en/...`; root `/` redirects by `Accept-Language`.
- Design source of truth: Magic Patterns artifact `e0bad8ad-3ef0-43df-a1b4-bbeafdae8637` (editor `bq3jgjpcmh218crxjqocdk`). The rendered site must visually match it.
- Design tokens: `flamenco.red #c1121f`, `flamenco.dark #0a0a0a`, `flamenco.light #f5f0e8`; fonts Cormorant Garamond (serif/headings) + Inter (sans/body).
- Everything user-visible must be editable in Sanity Studio — no hardcoded copy, images, video, nav, or contact info in components (aria-labels and locale-dictionary UI strings excepted, which live in a checked-in dictionary).
- Target host: Vercel. Keep Vercel-specific APIs out of app logic anyway.
- Env vars (`.env.local`, documented in `.env.example`): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET=production`, `NEXT_PUBLIC_SANITY_API_VERSION=2026-07-01`, `SANITY_API_READ_TOKEN` (viewer, for draft preview), `SANITY_API_WRITE_TOKEN` (editor, for submissions + seed), `RESEND_API_KEY`, `SIGNUP_NOTIFICATION_EMAIL`, `SANITY_REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`.
- Commit after every task (small, conventional commits).

---

### Task 1: Scaffold Next.js app + snapshot design reference

**Files:**
- Create: entire Next.js scaffold at repo root (`app/`, `package.json`, `tsconfig.json`, etc.)
- Create: `design-reference/` (verbatim copy of the Magic Patterns artifact files, for later component ports)
- Create: `.env.example`

**Interfaces:**
- Produces: running Next.js app (`pnpm dev`), Tailwind v4 theme tokens `--color-flamenco-red/dark/light`, fonts wired via `next/font`, `design-reference/*` files.

- [ ] **Step 1: Scaffold**

```bash
cd /Users/oyr/projects/flamenco-talento
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-pnpm --turbopack
pnpm add framer-motion lucide-react
```

(The repo only contains LICENSE + .claude; create-next-app into `.` is fine. If it refuses due to existing files, scaffold in a temp dir and move contents in.)

- [ ] **Step 2: Snapshot the design**

Using MCP tool `mcp__magic-patterns__read_artifact_files` with artifactId `e0bad8ad-3ef0-43df-a1b4-bbeafdae8637`, write ALL of these files verbatim into `design-reference/`: `App.tsx`, `index.css`, `tailwind.config.js`, `components/{Header,Hero,Marquee,About,Pedagog,Timeplan,Pris,Nyheter,Gallery,Footer,Logo}.tsx`. This folder is reference-only (add a `design-reference/README.md` line saying so); it is never imported by the app.

- [ ] **Step 3: Theme + fonts**

Replace `app/globals.css` Tailwind theme section with:

```css
@import "tailwindcss";

@theme {
  --color-flamenco-red: #c1121f;
  --color-flamenco-dark: #0a0a0a;
  --color-flamenco-light: #f5f0e8;
  --font-serif: var(--font-cormorant), serif;
  --font-sans: var(--font-inter), sans-serif;
}

html { scroll-behavior: smooth; }
body {
  @apply bg-flamenco-dark text-flamenco-light font-sans antialiased selection:bg-flamenco-red selection:text-white;
}
h1, h2, h3, h4, h5, h6 { @apply font-serif; }
```

In `app/layout.tsx` load fonts with `next/font/google`:

```tsx
import { Cormorant_Garamond, Inter } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter" });
```

and put `${cormorant.variable} ${inter.variable}` on `<html>`.

- [ ] **Step 4: Verify**

Run: `pnpm dev` → open http://localhost:3000, confirm dark background + font vars in devtools. Run `pnpm build` → succeeds.

- [ ] **Step 5: Create `.env.example`** listing every env var from Global Constraints with placeholder values.

- [ ] **Step 6: Commit** — `chore: scaffold next.js app with tailwind theme and design reference`

---

### Task 2: Sanity project + embedded Studio

**Files:**
- Create: `sanity.config.ts`, `sanity.cli.ts`, `sanity/env.ts`, `sanity/lib/client.ts`, `sanity/lib/image.ts`
- Create: `app/studio/[[...tool]]/page.tsx`

**Interfaces:**
- Produces: `client` (read, CDN), `writeClient` (token), `urlFor(image)` helper; Studio served at `/studio`.

- [ ] **Step 1: Create Sanity project + install**

```bash
pnpm add next-sanity @sanity/vision sanity @sanity/image-url @sanity/document-internationalization
pnpm dlx sanity@latest init --env .env.local --create-project "Flamenco Talento" --dataset production
```

`sanity init` writes `NEXT_PUBLIC_SANITY_PROJECT_ID`/`DATASET` into `.env.local`. If interactive login is needed, ask the user to run `! pnpm dlx sanity login` first.

- [ ] **Step 2: Config files**

`sanity/env.ts`:

```ts
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-07-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
```

`sanity/lib/client.ts`:

```ts
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({ projectId, dataset, apiVersion, useCdn: true });
export const writeClient = createClient({
  projectId, dataset, apiVersion, useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
```

`sanity.config.ts` — `defineConfig` with `basePath: "/studio"`, plugins: `structureTool()`, `visionTool()` (schemas and more plugins added in Tasks 3 and 5). Mount in `app/studio/[[...tool]]/page.tsx` with `NextStudio` from `next-sanity/studio` (see next-sanity README; route needs `export const dynamic = "force-static"` and metadata/viewport re-exports from `next-sanity/studio`).

- [ ] **Step 3: Verify** — `pnpm dev`, open http://localhost:3000/studio, log in, empty Studio loads.

- [ ] **Step 4: Commit** — `feat: embed sanity studio at /studio`

---

### Task 3: Content schemas (documents + page-builder blocks) and Studio structure

**Files:**
- Create: `sanity/schemaTypes/index.ts`
- Create: `sanity/schemaTypes/documents/{page,newsPost,classItem,pricingPlan,galleryImage,teacher,siteSettings,submission}.ts`
- Create: `sanity/schemaTypes/blocks/{heroBlock,marqueeBlock,aboutBlock,pedagogBlock,timeplanBlock,prisBlock,galleryBlock,nyheterBlock,signupFormBlock}.ts`
- Create: `sanity/structure.ts` (desk structure)
- Modify: `sanity.config.ts` (register schema, i18n plugin, structure)

**Interfaces:**
- Produces: document types `page`, `newsPost`, `classItem`, `pricingPlan`, `galleryImage`, `teacher`, `siteSettings`, `submission`; object types `heroBlock`, `marqueeBlock`, `aboutBlock`, `pedagogBlock`, `timeplanBlock`, `prisBlock`, `galleryBlock`, `nyheterBlock`, `signupFormBlock`. Field names below are load-bearing — queries (Task 5), components (Task 7), and the seed (Task 10) use them exactly.

- [ ] **Step 1: Document schemas**

All translatable document types carry a hidden `language` string field (managed by the i18n plugin). Fields per type (all with sensible `title`/`description` in **Norwegian** so the Studio is friendly for the school — e.g. `title: "Overskrift"`):

- `page`: `title` (string, req), `slug` (slug, req, source title), `isFrontPage` (boolean, initial false), `blocks` (array of all nine block types), `seoDescription` (text), `language` (hidden string).
- `newsPost`: `title` (req), `slug` (req), `date` (date, req), `excerpt` (text, req), `featured` (boolean), `coverImage` (image, optional), `body` (array of `block` + `image`), `language`.
- `classItem`: `name` (string, req), `day` (string, options list: `mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag`, req), `startTime`/`endTime` (string, req, e.g. "17:30"), `level` (string, req), `sortOrder` (number), `language`.
- `pricingPlan`: `title` (req), `price` (string, req — e.g. "250,-"), `period` (string, req), `features` (array of string, req), `highlighted` (boolean), `highlightLabel` (string — "Mest Populær"), `sortOrder` (number), `language`.
- `galleryImage`: `image` (image with hotspot, req), `alt` (string, req), `size` (string options: `large|wide|small`, default small — maps to the design's col/row spans), `sortOrder` (number). NOT translated (add `alt` per language later if needed — no `language` field, shared across locales; `alt` is a single string).
- `teacher`: `name` (req), `role` (string), `image` (image, req), `bio` (array of `block`), `language`.
- `siteSettings`: `navLinks` (array of object `{label: string, href: string}`), `contactPhone`, `contactEmail`, `accountNumber`, `facebookUrl`, `instagramUrl`, `footerTagline` (text), `footerCopyrightName` (string), `language`. One document per language via the i18n plugin.
- `submission` (NOT translated, not on the site): `name`, `email`, `phone`, `interest` (string — the class/plan the person chose), `message` (text), `createdAt` (datetime), `handled` (boolean, initial false). `readOnly: true` on all fields except `handled`. Preview shows name + interest, with `handled` in the subtitle.

- [ ] **Step 2: Block schemas**

Blocks hold presentation config + references; every block gets a Norwegian `title` and an icon (lucide via `@sanity/icons` equivalents) plus a `preview` so the page-builder array reads nicely:

- `heroBlock`: `eyebrow` (string — "Etablert 2005"), `headingLine1` (string — "FLAMENCO"), `headingLine2` (string — "TALENTO", rendered red italic), `tagline` (text), `video` (file, accept `video/mp4`), `poster` (image), `primaryCta` `{label, href}`, `secondaryCta` `{label, href}`.
- `marqueeBlock`: `words` (array of string).
- `aboutBlock`: `heading` (string), `headingAccent` (string — the red italic word), `image` (image), `imageAlt` (string), `body` (array of `block`), `quote` (text).
- `pedagogBlock`: `heading`, `headingAccent`, `teacher` (reference to `teacher`, req).
- `timeplanBlock`: `heading`, `headingAccent`, `intro` (text), `locationNote` (string), `classes` (array of reference to `classItem`).
- `prisBlock`: `heading`, `headingAccent`, `plans` (array of reference to `pricingPlan`), `ctaLabelPrefix` (string — "Velg").
- `galleryBlock`: `heading`, `headingAccent`, `intro` (text), `images` (array of reference to `galleryImage`).
- `nyheterBlock`: `heading`, `headingAccent`, `seeAllLabel` (string), `count` (number, default 3) — posts are fetched automatically (latest N for the page's language), not referenced.
- `signupFormBlock`: `heading`, `headingAccent`, `intro` (text), `successMessage` (text).

- [ ] **Step 3: i18n plugin + structure**

In `sanity.config.ts` add:

```ts
documentInternationalization({
  supportedLanguages: [
    { id: "no", title: "Norsk" },
    { id: "en", title: "English" },
  ],
  schemaTypes: ["page", "newsPost", "classItem", "pricingPlan", "teacher", "siteSettings"],
}),
```

`sanity/structure.ts`: sidebar groups in Norwegian — "Sider" (page), "Nyheter" (newsPost), "Timeplan" (classItem), "Priser" (pricingPlan), "Galleri" (galleryImage), "Pedagog" (teacher), "Innstillinger" (siteSettings), divider, "Påmeldinger" (submission, ordered `createdAt desc`). Filter `submission` and translation-metadata types out of the default list.

- [ ] **Step 4: Verify** — open `/studio`, create a throwaway `page` with one of each block, confirm all fields render, references resolve, language badge appears. Delete the throwaway (seed comes in Task 10).

- [ ] **Step 5: Commit** — `feat: sanity schemas for page builder, collections, and submissions`

---

### Task 4: Locale routing (middleware + [lang] layout + dictionary)

**Files:**
- Create: `middleware.ts`, `lib/i18n.ts`, `lib/dictionary.ts`
- Create: `app/(site)/[lang]/layout.tsx`
- Modify: `app/layout.tsx` (becomes minimal root: html/body/fonts only)

**Interfaces:**
- Produces: `type Lang = "no" | "en"`, `LANGS`, `isLang()` from `lib/i18n.ts`; `dict(lang)` returning UI strings (form labels, "Les mer", aria-labels, validation messages); root `/` and any un-prefixed path redirect to `/no/...` or `/en/...` by `Accept-Language`.

- [ ] **Step 1: `lib/i18n.ts`**

```ts
export const LANGS = ["no", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "no";
export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}
```

- [ ] **Step 2: `middleware.ts`** — skip `/studio`, `/api`, `/_next`, files with extensions; if first path segment is not a lang, 307-redirect to `/{detected}{pathname}` where `detected` is `en` if the `Accept-Language` header prefers English over Norwegian, else `no`. Include a `matcher` config excluding the skipped prefixes.

- [ ] **Step 3: `lib/dictionary.ts`** — a plain object `{ no: {...}, en: {...} }` with keys used by components for non-CMS UI strings: `openMenu`, `closeMenu`, `readMore`, `backToNews`, form labels (`formName`, `formEmail`, `formPhone`, `formInterest`, `formMessage`, `formSubmit`, `formSending`, `formError`), and validation messages. Both languages fully written out (Norwegian mirrors the design's tone).

- [ ] **Step 4: `app/(site)/[lang]/layout.tsx`** — validates `params.lang` with `isLang` (else `notFound()`), sets `<html lang>` via metadata (generateMetadata alternates come in Task 9); renders `{children}` inside the dark shell div from the design's `App.tsx` (`min-h-screen bg-flamenco-dark ...`). `generateStaticParams` returns both langs.

- [ ] **Step 5: Verify** — `curl -sI localhost:3000/ -H 'Accept-Language: en-US'` → `location: /en`; with `nb-NO` → `/no`. `/studio` still loads un-redirected.

- [ ] **Step 6: Commit** — `feat: locale routing with no/en prefixes and UI dictionary`

---

### Task 5: GROQ queries, live fetch, draft mode + Presentation tool

**Files:**
- Create: `sanity/lib/live.ts`, `sanity/lib/queries.ts`, `app/api/draft-mode/enable/route.ts`
- Modify: `sanity.config.ts` (add `presentationTool`), `app/(site)/[lang]/layout.tsx` (add `<SanityLive />`)

**Interfaces:**
- Produces: `sanityFetch({ query, params })` and `<SanityLive />` from `sanity/lib/live.ts` (via next-sanity `defineLive` with `SANITY_API_READ_TOKEN`); queries: `PAGE_QUERY(slug, lang)`, `FRONT_PAGE_QUERY(lang)`, `SITE_SETTINGS_QUERY(lang)`, `NEWS_LIST_QUERY(lang)`, `NEWS_POST_QUERY(slug, lang)`, `LATEST_NEWS_QUERY(lang, count)`, `PAGE_SLUGS_QUERY`, `TRANSLATIONS_QUERY(id)` (for the language switcher).

- [ ] **Step 1: `sanity/lib/live.ts`** per next-sanity v9 `defineLive` docs (context7 `/sanity-io/next-sanity` if unsure): export `sanityFetch` and `SanityLive`, using `client` + `serverToken`/`browserToken` from `SANITY_API_READ_TOKEN`.

- [ ] **Step 2: Queries** (`defineQuery` from next-sanity). Key shapes — blocks expand references inline so the renderer gets plain data:

```groq
*[_type == "page" && slug.current == $slug && language == $lang][0]{
  title, seoDescription, "slug": slug.current, language,
  blocks[]{
    ...,
    _type == "pedagogBlock" => { teacher-> },
    _type == "timeplanBlock" => { classes[]-> },
    _type == "prisBlock" => { plans[]-> },
    _type == "galleryBlock" => { images[]-> }
  }
}
```

`FRONT_PAGE_QUERY` is the same with `isFrontPage == true` instead of the slug match. `LATEST_NEWS_QUERY`: `*[_type == "newsPost" && language == $lang] | order(date desc)[0...$count]{...}`. `TRANSLATIONS_QUERY`: query `translation.metadata` documents to map a document `_id` to its other-language slug.

- [ ] **Step 3: Draft mode + Presentation.** `app/api/draft-mode/enable/route.ts` = `defineEnableDraftMode({ client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }) })` from `next-sanity/draft-mode`. In `sanity.config.ts` add `presentationTool({ previewUrl: { origin: process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? "http://localhost:3000", previewMode: { enable: "/api/draft-mode/enable" } } })`. Add `<SanityLive />` to the `[lang]` layout.

- [ ] **Step 4: Verify** — Studio → Presentation tab loads the site in the iframe (will 404 until Task 6's route exists; verify again after Task 6).

- [ ] **Step 5: Commit** — `feat: groq queries, live content, draft mode and presentation tool`

---

### Task 6: Page-builder renderer + catch-all route

**Files:**
- Create: `components/blocks/BlockRenderer.tsx`
- Create: `app/(site)/[lang]/[[...slug]]/page.tsx`

**Interfaces:**
- Consumes: `sanityFetch`, `PAGE_QUERY`/`FRONT_PAGE_QUERY`, `Lang`.
- Produces: `<BlockRenderer blocks={page.blocks} lang={lang} />` mapping `_type` → component from Task 7; catch-all page component with `generateStaticParams` (all page slugs × langs) and `notFound()` for missing pages. Front page = empty slug.

- [ ] **Step 1: BlockRenderer** — a typed map `Record<BlockType, Component>`; unknown types render nothing (log in dev). Each block wrapper gets `data-sanity` attributes automatically via stega — no manual work needed; just don't strip stega strings (use `stegaClean` from `next-sanity` only for values used in logic, e.g. `size`, `day`, hrefs).

- [ ] **Step 2: Route** — `app/(site)/[lang]/[[...slug]]/page.tsx`: slug `undefined` → `FRONT_PAGE_QUERY`, else join segments and use `PAGE_QUERY`. Start with placeholder block components (each block type renders its heading in an empty section) so the pipeline is testable end-to-end before Task 7 ports the real designs. NOTE: `nyheter` is reserved by the static route in Task 8 — Next prefers static segments; add a guard that the catch-all `notFound()`s for slug `nyheter` to be explicit.

- [ ] **Step 3: Verify** — create a draft front page in Studio with two blocks; Presentation shows headings live as you type (draft mode working); published page renders at `/no`.

- [ ] **Step 4: Commit** — `feat: page builder catch-all route with block renderer`

---

### Task 7: Port the design components as CMS-driven blocks

**Files:**
- Create: `components/blocks/{Hero,Marquee,About,Pedagog,Timeplan,Pris,Gallery,Nyheter,SignupSection}.tsx`
- Create: `components/site/{Header,Footer,Logo,LanguageSwitcher}.tsx`, `components/site/Motion.tsx`
- Modify: `app/(site)/[lang]/layout.tsx` (render Header/Footer with `SITE_SETTINGS_QUERY` data), `components/blocks/BlockRenderer.tsx` (swap placeholders for real components)

**Interfaces:**
- Consumes: block data shapes from Task 5's queries (expanded references), `urlFor`, `dict(lang)`.
- Produces: pixel-faithful sections. Each component's props = `{ block: <QueryResultBlockType>, lang: Lang }`.

- [ ] **Step 1: Porting rules (apply to every component from `design-reference/components/`)**

1. Copy the JSX/classNames **verbatim** — the visual design is already approved; do not restyle.
2. Components using framer-motion or hooks stay client components (`"use client"`); they receive data as props from the server-rendered BlockRenderer. Header stays client (scroll + menu state).
3. Replace every hardcoded string/array/image/video with the corresponding block/document field (mapping is 1:1 with the schema fields defined in Task 3 — e.g. Hero: `Etablert 2005` → `block.eyebrow`, video `src` → file asset URL, buttons → `primaryCta`/`secondaryCta`; Marquee `words` → `block.words`; Timeplan: group `block.classes` by `day` (ordered mandag→søndag, using stegaClean on `day`), render `startTime - endTime`; Pris: `plan.highlightLabel` replaces "Mest Populær"; Gallery: `size` → className map `{large: "col-span-1 md:col-span-2 row-span-2", wide: "col-span-1 md:col-span-2 row-span-1", small: "col-span-1 row-span-1"}`; Footer/Header: nav + contact from `siteSettings`).
4. `<img>` → `next/image` with `urlFor(image).width(...).url()` (keep the grayscale/hover classes; set `fill` + `sizes` where the design uses `object-cover` containers). Hero `<video>` keeps `autoPlay loop muted playsInline`, `src` = `block.video` asset URL, `poster` = `urlFor(block.poster)`.
5. Portable Text fields (`about.body`, `teacher.bio`, `newsPost.body`) render with `@portabletext/react` (add dep) using components that reproduce the design's `<p>` classes.
6. Nyheter block fetches nothing itself — BlockRenderer passes it `posts` fetched via `LATEST_NEWS_QUERY(lang, block.count)` (fetch in the server BlockRenderer, not the client component). Cards/`Les mer` link to `/${lang}/nyheter/${slug}`.
7. `SignupSection` renders the `signupFormBlock` heading/intro and mounts the (client) form component — form logic itself arrives in Task 8; until then render the section with a disabled form shell. Section `id="kontakt"` so the design's `#kontakt` anchors land here. Hero/Pris CTAs keep their CMS-provided hrefs (seed uses `#kontakt`, `#timeplan`).
8. Section `id`s: derive from block type (`hjem`, `om`, `pedagog`, `timeplan`, `pris`, `galleri`, `nyheter`, `kontakt`) so the seeded navLinks' anchor hrefs work.
9. `LanguageSwitcher` (in Header, styled like the nav links: `NO / EN`): swaps the locale prefix on the current path; on news detail pages it needs the translated slug — pass an optional `altHref` through a small context or prop from pages that know it (keep simple: default = same path with prefix swapped).

- [ ] **Step 2: Verify visually** — seed is not in yet, so temporarily fill Studio with one front page + a couple of classes/plans/images by hand OR fast-forward Task 10's seed script if easier. Compare side-by-side against the Magic Patterns preview at desktop + mobile widths. Check: header scroll transition, mobile menu, marquee loop, hover states, pricing highlight scale, gallery grid spans.

- [ ] **Step 3: Run `pnpm build`** — no type errors, all pages static where expected.

- [ ] **Step 4: Commit** — `feat: port all design sections as sanity-driven blocks`

---

### Task 8: Signup form via tRPC + Sanity + Resend

**Files:**
- Create: `server/trpc.ts`, `server/routers/_app.ts`, `server/routers/signup.ts`, `server/rateLimit.ts`
- Create: `app/api/trpc/[trpc]/route.ts`
- Create: `lib/trpc/client.ts`, `lib/trpc/Provider.tsx`
- Create: `components/blocks/SignupForm.tsx` (client), test `server/routers/signup.test.ts`, `server/rateLimit.test.ts`
- Modify: `components/blocks/SignupSection.tsx` (mount real form), `app/(site)/[lang]/layout.tsx` (wrap in tRPC Provider)

**Interfaces:**
- Consumes: `writeClient` (Task 2), `dict(lang)` (Task 4).
- Produces: `appRouter` with `signup.submit` mutation. Input zod schema: `{ name: string.min(2), email: string.email(), phone: string.optional(), interest: string.min(1), message: string.max(2000).optional(), website: string.max(0) (honeypot), lang: enum(["no","en"]) }`. Output `{ ok: true }`. Creates a `submission` doc and sends Resend email; email failure does not fail the mutation (submission is already stored — log the error).

- [ ] **Step 1: Install + test setup**

```bash
pnpm add @trpc/server @trpc/client @trpc/react-query @tanstack/react-query zod superjson resend
pnpm add -D vitest
```

Add `"test": "vitest run"` to package.json scripts.

- [ ] **Step 2: Write failing tests** for the pure parts:

`server/rateLimit.test.ts` — in-memory sliding-window limiter `createRateLimiter({ limit: 5, windowMs: 3600_000 })`:

```ts
import { describe, it, expect, vi } from "vitest";
import { createRateLimiter } from "./rateLimit";

describe("rateLimiter", () => {
  it("allows up to limit hits per key within the window", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => 0 });
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(false);
    expect(rl.check("5.6.7.8")).toBe(true);
  });
  it("resets after the window", () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t });
    expect(rl.check("k")).toBe(true);
    expect(rl.check("k")).toBe(false);
    t = 1001;
    expect(rl.check("k")).toBe(true);
  });
});
```

`server/routers/signup.test.ts` — call `signup.submit` via `appRouter.createCaller` with mocked `writeClient.create` and mocked Resend (inject both through the tRPC context: `{ ip, sanity: { create }, sendEmail }`): asserts (a) valid input → sanity `create` called with `_type: "submission"` and the input fields + `handled: false`; (b) filled honeypot (`website: "x"`) → zod rejects (TRPCError BAD_REQUEST); (c) rate-limited ip → TRPCError `TOO_MANY_REQUESTS`; (d) sendEmail rejection still returns `{ ok: true }`.

- [ ] **Step 3: Run tests, verify they fail** — `pnpm test` → module-not-found / assertion failures.

- [ ] **Step 4: Implement** `rateLimit.ts` (Map of key → timestamps, prune on check; `now` injectable, defaults `Date.now`), `server/trpc.ts` (initTRPC with superjson, context type `{ ip: string; sanity: Pick<SanityClient, "create">; sendEmail: (s: Submission) => Promise<unknown> }`), `signup.ts` mutation implementing the contract above (createdAt via `new Date().toISOString()`; email via Resend `emails.send` to `SIGNUP_NOTIFICATION_EMAIL`, from `Flamenco Talento <onboarding@resend.dev>` until a domain is verified, subject `Ny påmelding: ${interest}`, simple text body with all fields). `app/api/trpc/[trpc]/route.ts` = `fetchRequestHandler` building real context (ip from `x-forwarded-for`, module-level rate limiter, real writeClient + resend). Note in code: in-memory limiter is per-serverless-instance — acceptable as a soft spam brake alongside the honeypot.

- [ ] **Step 5: Run tests, verify pass** — `pnpm test` → all green.

- [ ] **Step 6: Client form.** `lib/trpc/client.ts` + `Provider.tsx` (standard @trpc/react-query setup, httpBatchLink to `/api/trpc`, superjson). `SignupForm.tsx`: fields name/email/phone/interest(select populated from a prop: class names + plan titles passed down by BlockRenderer from the same page data)/message, hidden `website` honeypot input (`className="hidden" tabIndex={-1} autoComplete="off"`), labels from `dict(lang)`, styling matching the design language (zinc-900 panel, white/10 borders, flamenco-red submit button, uppercase tracking-widest labels). On success replace form with `block.successMessage`. On error show `dict.formError`.

- [ ] **Step 7: Verify end-to-end** — submit the form on `/no`; confirm a `submission` doc appears under Påmeldinger in Studio; with a real `RESEND_API_KEY` in `.env.local` confirm the email arrives (or log output if the user hasn't provided the key yet — flag it).

- [ ] **Step 8: Commit** — `feat: signup form with trpc, sanity storage and resend notification`

---

### Task 9: News routes, metadata/SEO, sitemap

**Files:**
- Create: `app/(site)/[lang]/nyheter/page.tsx`, `app/(site)/[lang]/nyheter/[slug]/page.tsx`
- Create: `app/sitemap.ts`, `app/robots.ts`
- Modify: page routes (`[[...slug]]`, news pages) with `generateMetadata`

**Interfaces:**
- Consumes: `NEWS_LIST_QUERY`, `NEWS_POST_QUERY`, `TRANSLATIONS_QUERY`, portable-text components from Task 7.

- [ ] **Step 1: News list page** — heading styled like the design's section headers ("Siste Nytt" / "Latest News" from dict or a dedicated `page`? Use the nyheterBlock visual language), grid of all posts (featured card style for the newest, standard cards for the rest — reuse the Nyheter block card markup extracted into a shared `NewsCard` component in `components/blocks/Nyheter.tsx`).

- [ ] **Step 2: News detail page** — hero-less article layout: date eyebrow (flamenco-red, tracking-widest), serif title, optional cover image, portable-text body (`prose`-like custom classes matching the design's `text-flamenco-light/80 text-lg leading-relaxed`), back-link (`dict.backToNews`). `generateStaticParams` from all newsPost slugs × lang.

- [ ] **Step 3: Metadata** — `generateMetadata` on all site routes: title `${page.title} | Flamenco Talento`, description from `seoDescription`/`excerpt`, `alternates.languages` mapping `no`/`en` URLs (use `TRANSLATIONS_QUERY` for news detail; symmetric prefix swap for pages), openGraph basic fields. `app/sitemap.ts`: all pages + news posts in both languages from `PAGE_SLUGS_QUERY` + news slugs; `app/robots.ts`: allow all, disallow `/studio`, sitemap URL from `NEXT_PUBLIC_SITE_URL`.

- [ ] **Step 4: Verify** — `pnpm build`; check `/no/nyheter`, a detail page, `curl localhost:3000/sitemap.xml`, and view-source metadata alternates.

- [ ] **Step 5: Commit** — `feat: news pages, seo metadata and sitemap`

---

### Task 10: Seed script (design content, both languages)

**Files:**
- Create: `scripts/seed.ts`, add script `"seed": "tsx scripts/seed.ts"` (`pnpm add -D tsx @types/node` if missing)

**Interfaces:**
- Consumes: `writeClient` field names from Task 3 — must match exactly.
- Produces: fully populated dataset that renders the design 1:1 at `/no`, plus English translations.

- [ ] **Step 1: Write the seed script.** Idempotent: uses `createOrReplace` with fixed `_id`s (e.g. `seed-page-front-no`, `seed-class-nybegynner-no`, …). Content = exactly the strings in `design-reference/` for Norwegian. It must:

1. Upload media assets: the four Unsplash gallery/about/pedagog images (download → `client.assets.upload("image", …)`) and the hero video from `https://cdn.magicpatterns.com/uploads/dt9vniBT7UzxiK1P7B7mXb/Make_me_a_video_of_a_female_fl.mp4` (`assets.upload("file", …)`).
2. Create NO + EN versions of: 6 `classItem`s (Nybegynner, Teknikk & Koreografi, Viderekommende, Bata de Cola, Flamenco Fitness, Kompani Trening — days/times/levels exactly as in `design-reference/components/Timeplan.tsx`), 3 `pricingPlan`s (Drop-in 250,-/per klasse; Semesterkort 3200,-/per semester highlighted "Mest Populær"; Klippekort 2200,-/10 klipp — features verbatim), 3 `newsPost`s (dates 2026-08-19, 2026-09-12, 2026-10-05; titles/excerpts from Nyheter.tsx; body = excerpt expanded to 2 short paragraphs), 4 `galleryImage`s (sizes: large, small, small, wide — matching the design's spans), 1 `teacher` (Danitza Madeleine Rogers Olea, role "Kunstnerisk Leder & Hovedpedagog", bio = the three Pedagog paragraphs), `siteSettings` (nav Hjem/Om oss/Pedagog/Timeplan/Pris/Galleri/Nyheter → `#hjem` etc.; phone `412 88 996`, email `danitza@flamenco-talento.no`, kontonr `6524 10 66627`, footer tagline = the quote), and the front `page` (isFrontPage, slug `forside`/`home`) with blocks in design order: hero (eyebrow "Etablert 2005", heading FLAMENCO/TALENTO, tagline "Opplev lidenskapen…", CTAs "Meld deg på"→`#kontakt`, "Les mer"→`#om`), marquee (PASIÓN DUENDE COMPÁS TACONEO ARTE FLAMENCO ALMA FUERZA), about ("Om"/"Skolen" + body + quote "I flamencoen ligger følelsene…"), pedagog, timeplan ("Høstens"/"Timeplan", intro, location "Alle klasser holdes i våre lokaler i Oslo sentrum.", all 6 classes), pris ("Priser &"/"Påmelding", 3 plans), gallery ("Flamenco"/"Kunst" + intro), nyheter ("Siste"/"Nytt", "Se alle nyheter", count 3), signupForm ("Meld deg"/"på", intro + success message — write natural Norwegian copy in the school's tone).
3. English translations: translate all of the above to natural English (write real translations in the script — e.g. hero tagline "Experience the passion, rhythm and power of authentic flamenco in the heart of Norway."; marquee words stay Spanish; names/times/prices unchanged). Class/plan EN docs mirror NO with translated names/levels/features.
4. Create `translation.metadata` documents linking each NO/EN pair (`_type: "translation.metadata"`, `translations` array of keyed references — check @sanity/document-internationalization docs for the exact shape).

- [ ] **Step 2: Run it** — `pnpm seed` (needs `SANITY_API_WRITE_TOKEN`; create an "Editor" token in sanity.io/manage if the user hasn't — ask via `!` command if interactive). Re-run to confirm idempotency (no dupes).

- [ ] **Step 3: Verify** — `/no` matches the Magic Patterns design section-for-section including media; `/en` fully translated; Studio shows linked translations; news detail pages exist.

- [ ] **Step 4: Commit** — `feat: seed script with design content in norwegian and english`

---

### Task 11: ISR + revalidation webhook

**Files:**
- Create: `app/api/revalidate/route.ts`
- Modify: `sanity/lib/live.ts` / fetch call sites if tag wiring is needed

**Interfaces:**
- Produces: POST `/api/revalidate` validating Sanity webhook signature (`SANITY_REVALIDATE_SECRET`, `parseBody` from `next-sanity/webhook`), calling `revalidateTag` for the changed `_type` (tag fetches by type: `sanityFetch` in next-sanity v9 handles live/ISR automatically — if using `defineLive` the SanityLive component + `revalidateTag("sanity")` pattern applies; follow the next-sanity README's "ISR + webhook" recipe, context7 `/sanity-io/next-sanity`).

- [ ] **Step 1: Implement route** per the recipe; return `{ revalidated: true, type }`.
- [ ] **Step 2: Verify locally** — `curl -X POST localhost:3000/api/revalidate` with a signed test payload (use `@sanity/webhook`'s sign helper in a scratch script) → 200; bad signature → 401. Document in README that the webhook (URL `${SITE_URL}/api/revalidate`, secret, dataset production, all document types) must be created in sanity.io/manage on deploy.
- [ ] **Step 3: Commit** — `feat: sanity webhook revalidation`

---

### Task 12: Final verification + README + deploy prep

**Files:**
- Create: `README.md` (setup, env vars, seed, Studio guide for the school in Norwegian: "how to edit the front page, add a news post, see påmeldinger, switch language versions")
- Modify: anything the checks below surface

- [ ] **Step 1: Full check pass**

```bash
pnpm lint && pnpm test && pnpm build
```

All green, no type errors, no `any`.

- [ ] **Step 2: Runtime verification (use the codex-computer-use skill or Playwright MCP)** — walk: `/` redirect → `/no` renders all 9 sections matching the design → mobile menu works → language switch to `/en` → news list + detail → submit signup form → submission visible in Studio → edit hero tagline in Presentation, see it live, publish. Screenshot desktop + mobile for the user.

- [ ] **Step 3: Write README** as described.

- [ ] **Step 4: Commit** — `docs: readme and setup guide`. Offer the user: deploy to Vercel now (`vercel` CLI, set env vars, add the Sanity webhook + CORS origin for the deployed URL in sanity.io/manage, update `SANITY_STUDIO_PREVIEW_ORIGIN`) or hand off.

---

## Self-Review Notes

- Spec coverage: page builder w/ generic pages (T3/T6), referenced data docs (T3), embedded Studio (T2), Presentation live preview (T5), no/en document-level i18n with prefix routing + root redirect (T3/T4), hero video via Sanity upload (T3/T7/T10), signup → tRPC → Sanity + Resend with honeypot/rate limit (T8), news routes (T9), design-content seed incl. EN (T10), Vercel + ISR webhook (T11), pnpm + no-any + Tailwind (global).
- Deliberate scope cuts (agreed in grilling): no payments, no capacity tracking, no accounts.
- Risk callouts: exact `defineLive`/webhook API shapes should be confirmed against the next-sanity README (context7) at implementation time; `translation.metadata` shape likewise. `sanity init` and token creation may need interactive user login.
