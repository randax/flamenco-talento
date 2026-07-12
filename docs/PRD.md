# PRD — Flamenco Talento Website

- **Status:** Approved (grilling session 2026-07-12)
- **Owner:** Øyvind Randa
- **Related:** [ARD](./ARD.md) · [RFC-001](./RFC-001-flamenco-talento-website.md) · [Implementation plan](./superpowers/plans/2026-07-12-flamenco-talento-website.md)

## 1. Background

Flamenco Talento is a flamenco dance school in Oslo, established 2005, led by Danitza Madeleine Rogers Olea. The school needs a public website that presents the school, its teacher, weekly schedule, prices, news, and gallery — and lets prospective students sign up. A finished visual design exists (Magic Patterns artifact `bq3jgjpcmh218crxjqocdk`): a dark, cinematic one-page scroller in Norwegian.

The school has no developer on staff. After launch, **all content changes must be possible for non-technical staff** through a friendly CMS.

## 2. Goals

1. Ship a site that visually matches the approved design 1:1 at launch.
2. Every piece of user-visible content (text, images, video, schedule, prices, news, nav, contact info) is editable in Sanity Studio without a developer.
3. Prospective students can sign up / make contact; the school never loses a submission.
4. Serve both Norwegian and English audiences.
5. Editors can compose new pages from existing sections without a developer.

### Non-goals (explicitly out of scope)

- Online payment / checkout (payment is Vipps at the door — stated in the design copy).
- Class capacity tracking, rosters, or student accounts.
- CRM features beyond a simple submissions inbox.
- Additional languages beyond no/en.

## 3. Users

| User | Needs |
|---|---|
| Prospective student (NO) | Understand the school, find a class/level, see prices, sign up. Primary audience. |
| Prospective student (EN) | Same, in English (expats/internationals in Oslo). |
| Returning student | Check this semester's schedule and news (workshops, performances). |
| School staff (editor) | Update all content, publish news, see and handle signups — with live preview and without breaking the design. |

## 4. Functional requirements

### 4.1 Public site

- **FR-1 Landing page** with sections in design order: Hero (full-screen background video, headline, two CTAs), Marquee (scrolling Spanish words), About, Pedagog (teacher bio + photo), Timeplan (classes grouped by weekday with time and level), Pris (three pricing cards, one highlighted), Gallery (4-image mosaic), Nyheter (1 featured + 2 standard news teasers), Footer (contact, socials, account number, quick links).
- **FR-2 News**: `/[lang]/nyheter` lists all posts; `/[lang]/nyheter/[slug]` renders full articles (rich text + optional cover image). Teaser "Les mer" and "Se alle nyheter" link into these routes.
- **FR-3 Signup**: "Meld deg på" / "Velg <plan>" CTAs lead to a signup form (name, email, phone, interest = class or plan, message). Submissions are stored in Sanity **and** emailed to the school via Resend. Spam protection: honeypot field + per-IP rate limiting. No captcha.
- **FR-4 Language**: URLs are prefixed `/no/...` and `/en/...`; root `/` redirects by browser `Accept-Language`; a header switcher toggles languages. Norwegian and English content can be published independently.
- **FR-5 Arbitrary pages**: editors can create new pages (e.g. `/no/workshops`) composed of any of the nine section blocks.

### 4.2 Editing (Sanity Studio)

- **FR-6 Page builder**: pages are an ordered array of section blocks; editors add, remove, reorder, and configure sections.
- **FR-7 Referenced data**: classes, pricing plans, news posts, gallery images, and the teacher are top-level documents with their own Studio sections; blocks reference them. Site-wide settings (nav, contact, socials, footer) live in a settings document.
- **FR-8 Live preview**: Sanity Presentation tool — editors see the real site inside Studio, click any section to jump to its fields, and preview drafts before publishing.
- **FR-9 Submissions inbox**: a "Påmeldinger" section shows signups (read-only fields) with a "handled" checkbox.
- **FR-10 Hero video** is uploaded/replaced by editors as a file in Studio (with poster image fallback).
- **FR-11 Studio language**: field labels, section names, and descriptions in Norwegian.

### 4.3 Content at launch

- **FR-12 Seed**: the site launches pre-populated with the design's Norwegian copy, schedule, prices, news, media — plus full English translations — so day one matches the mockup exactly.

## 5. Quality requirements

- **QR-1 Visual fidelity**: matches the Magic Patterns design at desktop and mobile, including animations (scroll reveals, marquee, hover states, header scroll transition, mobile menu).
- **QR-2 Performance**: pages are statically rendered with ISR; publishing in Sanity updates the live site within seconds via webhook revalidation. No per-request CMS fetches on the hot path.
- **QR-3 SEO**: per-page metadata from CMS, `hreflang` alternates between language versions, sitemap, robots (Studio excluded).
- **QR-4 Reliability of signups**: a signup is persisted in Sanity even if the notification email fails.
- **QR-5 Accessibility basics**: semantic landmarks, alt texts from CMS, keyboard-usable menu and form, `lang` attribute per locale.

## 6. Launch checklist / acceptance

1. `/` redirects by browser language; `/no` renders all nine sections matching the design; `/en` is fully translated.
2. Editing the hero tagline in Presentation shows the change live; publishing updates the site without a deploy.
3. A new page created in Studio from blocks renders at its slug in both languages.
4. Submitting the signup form produces a Sanity submission document and an email to `SIGNUP_NOTIFICATION_EMAIL`.
5. A news post created in Studio appears in the landing teaser, list page, and its own detail page.
6. Lint, tests, and production build pass; deployed on Vercel with webhook + CORS configured.
