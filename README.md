# Flamenco Talento

Nettsted for flamencoskolen **Flamenco Talento** (Oslo). Bygget med Next.js 16
(App Router, Cache Components) og Sanity som hodeløst CMS, med tospråklig
innhold (norsk/engelsk), en påmeldingsflyt (tRPC → Sanity + Resend) og en
innebygd Sanity Studio med live-forhåndsvisning.

---

## Teknisk stack

- **Next.js 16** (App Router, Turbopack, Cache Components / Partial Prerender)
- **Sanity v4** — hodeløst CMS, innebygd Studio på `/studio`
- **next-sanity 13** — `sanityFetch` + Live Content API (`<SanityLive />`)
- **tRPC v11** + **superjson** — påmeldings-endepunkt
- **Resend** — e-postvarsel ved påmelding
- **Tailwind CSS v4** — styling
- **Zod** — validering (inkl. honeypot mot spam)
- **Vitest** — enhetstester
- **pnpm** — pakkehåndterer

---

## Kom i gang

```bash
pnpm install
cp .env.example .env.local   # fyll inn verdiene under
pnpm seed                    # laster inn demo-innhold (49 dok + 5 mediefiler)
pnpm dev                     # http://localhost:3000
```

Sanity-prosjektet er allerede opprettet (`sanity init` er kjørt). Du trenger kun
gyldige verdier i `.env.local`.

### Miljøvariabler (`.env.local`)

| Variabel | Påkrevd | Beskrivelse |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ja | Sanity prosjekt-ID (f.eks. `tvu5tkrh`). |
| `NEXT_PUBLIC_SANITY_DATASET` | ja | Datasett, vanligvis `production`. |
| `NEXT_PUBLIC_SANITY_API_VERSION` | ja | API-dato, f.eks. `2026-07-01`. |
| `SANITY_API_READ_TOKEN` | ja | Lese-token (Viewer). Brukes av `sanityFetch` og draft-forhåndsvisning. |
| `SANITY_API_WRITE_TOKEN` | ja | Skrive-token (Editor). Brukes av påmelding (`create submission`) og `pnpm seed`. |
| `SANITY_REVALIDATE_SECRET` | ja | Delt hemmelighet for webhook-signaturen til `/api/revalidate`. |
| `SANITY_STUDIO_PREVIEW_ORIGIN` | ja | Origin som Presentation forhåndsviser mot (dev: `http://localhost:3000`). |
| `RESEND_API_KEY` | valgfri | Resend-nøkkel. Uten den hoppes e-postvarsel over (påmeldingen lagres likevel). |
| `SIGNUP_NOTIFICATION_EMAIL` | valgfri | Mottaker for påmeldingsvarsel. |
| `NEXT_PUBLIC_SITE_URL` | ja | Absolutt base-URL for metadata/sitemap/hreflang. |

> **Merk om e-post i test-modus:** avsenderen er `onboarding@resend.dev`. Resend
> tillater da *kun* utsending til e-postadressen som eier Resend-kontoen. For at
> `SIGNUP_NOTIFICATION_EMAIL` skal motta varsler i produksjon må du verifisere et
> eget domene på resend.com/domains og bytte `from`-adressen i
> `app/api/trpc/[trpc]/route.ts`.

---

## Scripts

| Kommando | Hva den gjør |
|---|---|
| `pnpm dev` | Utviklingsserver på `:3000`. |
| `pnpm build` | Produksjonsbygg. |
| `pnpm start` | Kjør produksjonsbygget. |
| `pnpm lint` | ESLint. |
| `pnpm typecheck` | `tsc --noEmit`. |
| `pnpm test` | Vitest (enhetstester for validering + rate-limit). |
| `pnpm seed` | Laster demo-innhold inn i Sanity. Idempotent — trygg å kjøre flere ganger (mediefiler dedupliseres på `originalFilename`). |

---

## Arkitektur

Forsiden er en **page builder**: `page`-dokumenter i Sanity holder en liste med
blokker (hero, marquee, om, pedagog, timeplan, pris, galleri, nyheter,
påmeldingsskjema) som `BlockRenderer` mapper til React-komponenter. Timeplan- og
pris-blokkene refererer til egne `classItem`/`pricingPlan`-dokumenter, og
påmeldingsskjemaets interesse-nedtrekk fylles automatisk fra de samme blokkene.
Innhold hentes med next-sanity 13 `sanityFetch` inne i `'use cache'`-grenser
(Cache Components er på), og revalideres on-demand via Live Content API mens en
side er åpen, samt via en Sanity-webhook (`/api/revalidate`) for sider ingen har
åpne. Tospråklighet er dokument-basert (`@sanity/document-internationalization`)
med URL-prefiks (`/no`, `/en`); rot-`/` redirigerer via `Accept-Language`.

### Rutekart

| Rute | Innhold |
|---|---|
| `/` | 307-redirect til `/no` eller `/en` basert på `Accept-Language`. |
| `/[lang]` | Forsiden (page merket `isFrontPage`). |
| `/[lang]/[...slug]` | Generiske sider (page builder). |
| `/[lang]/nyheter` | Nyhetsliste. |
| `/[lang]/nyheter/[slug]` | Nyhetsartikkel (portable text). |
| `/studio` | Innebygd Sanity Studio (disallow i robots.txt). |
| `/api/trpc/[trpc]` | tRPC — `signup.submit`. |
| `/api/revalidate` | Sanity-webhook → `revalidateTag`. |
| `/api/draft-mode/enable` | Aktiverer draft-modus for Presentation. |
| `/sitemap.xml`, `/robots.txt` | SEO. Sitemap dekker begge språk + nyheter. |

---

## Deploy (Vercel)

1. **Importer repoet** i Vercel (rammeverk: Next.js, pakkehåndterer: pnpm).
2. **Sett miljøvariabler** (tabellen over) i Vercel Project Settings →
   Environment Variables. Sett `NEXT_PUBLIC_SITE_URL` og
   `SANITY_STUDIO_PREVIEW_ORIGIN` til den deployede URL-en (f.eks.
   `https://flamencotalento.no`).
3. **CORS-origin i Sanity:** gå til sanity.io/manage → prosjektet → API → CORS
   origins, og legg til deploy-URL-en (og `http://localhost:3000` for lokal
   Studio) med *Allow credentials* på. Uten dette kan ikke Studio/Presentation
   laste innhold i nettleseren.
4. **Webhook for revalidering:** sanity.io/manage → API → Webhooks → Create:
   - URL: `https://<din-side>/api/revalidate`
   - Dataset: `production`
   - Trigger: Create, Update, Delete (alle dokumenttyper)
   - Secret: samme verdi som `SANITY_REVALIDATE_SECRET`
5. **Resend:** verifiser et domene på resend.com/domains og bytt `from`-adressen
   i `app/api/trpc/[trpc]/route.ts` til en adresse på det domenet, slik at
   påmeldingsvarsler faktisk leveres.
6. **Seed (én gang, valgfritt):** kjør `pnpm seed` lokalt mot produksjons-
   datasettet dersom du vil legge inn demo-innholdet.

---

## Redaktørguide

Alt innhold redigeres i Sanity Studio på `https://<din-side>/studio` (lokalt:
`http://localhost:3000/studio`). Logg inn med Sanity-kontoen din.

### Redigere forsiden (med live-forhåndsvisning)

1. Åpne **Presentation** (øye-ikonet) i toppmenyen i Studio. Da ser du nettsiden
   ved siden av redigeringsfeltene.
2. Klikk på et element på siden (overskrift, tekst, bilde) for å hoppe rett til
   feltet som styrer det ("click-to-edit").
3. Endringer vises umiddelbart i forhåndsvisningen. De blir **først synlige for
   publikum når du trykker _Publish_** nederst.
4. Forsiden er bygget av blokker. Du kan endre rekkefølge, legge til eller
   fjerne blokker (hero, om skolen, pedagog, timeplan, priser, galleri, nyheter,
   påmelding) under `page`-dokumentet som er merket som forside.

### Legge til en nyhet

1. Gå til **Nyheter** (`newsPost`) i Studio → **Create**.
2. Fyll inn tittel, dato, ingress (excerpt), forsidebilde og brødtekst.
3. Sett **slug** (klikk *Generate*) — den blir en del av URL-en.
4. **Publish.** Artikkelen dukker opp på `/no/nyheter` og i "Siste Nytt" på
   forsiden.

### Se påmeldinger

Påmeldinger fra skjemaet lagres som **Påmeldinger** (`submission`) i Studio.
Hver oppføring viser navn, e-post, telefon, interesse, melding og tidspunkt, og
et **handled**-felt du kan huke av når påmeldingen er fulgt opp. (Er
`RESEND_API_KEY` satt, kommer det også en e-post til `SIGNUP_NOTIFICATION_EMAIL`
med emne «Ny påmelding: …».)

### Jobbe med norsk/engelsk

Hvert dokument finnes i en norsk og en engelsk versjon, koblet sammen av
document-internationalization:

1. Åpne et dokument. Øverst ser du et **språkvalg** (Norsk / English).
2. Mangler oversettelsen, bruk **Translations**-menyen for å opprette
   den andre språkversjonen — feltinnholdet kopieres som utgangspunkt.
3. Oversett feltene og **Publish** hver språkversjon for seg.
4. Sidene lenkes automatisk med `hreflang` slik at søkemotorer og
   språkbytteren på nettstedet finner riktig versjon. Bruk samme slug-struktur
   på tvers av språk der det er mulig.
