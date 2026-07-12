/**
 * Seed script for Flamenco Talento.
 *
 * Populates the Sanity dataset with the full design content in Norwegian (the
 * source of truth in `design-reference/`) plus natural English translations,
 * and links each NO/EN pair with a `translation.metadata` document so the
 * Studio's document-internationalization plugin recognises them.
 *
 * Idempotent: every document uses a fixed `_id` and `createOrReplace`, so the
 * script can be re-run without creating duplicates. Media assets are deduped by
 * `originalFilename` before uploading.
 *
 * Usage:
 *   pnpm seed              # real run (requires a valid project id + write token)
 *   pnpm seed --dry-run    # build every document and print a summary, no network
 *
 * NOTE: the real Sanity project does not exist yet (placeholder id, no token),
 * so the real run is deferred. Verify with `pnpm seed --dry-run`.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");

// ---------------------------------------------------------------------------
// Environment (tsx does not auto-load .env.local — parse it ourselves)
// ---------------------------------------------------------------------------

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  let raw: string;
  try {
    raw = readFileSync(envPath, "utf8");
  } catch {
    return; // absent in some environments; real-run guard below still applies
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SanityDoc = Record<string, unknown> & { _id: string; _type: string };

interface MediaSpec {
  filename: string;
  url: string;
  kind: "image" | "file";
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const ref = (id: string) => ({ _type: "reference", _ref: id });

const refItem = (id: string, key: string) => ({
  _type: "reference",
  _ref: id,
  _key: key,
});

const imageValue = (assetId: string) => ({
  _type: "image",
  asset: ref(assetId),
});

const fileValue = (assetId: string) => ({
  _type: "file",
  asset: ref(assetId),
});

/** A single portable-text paragraph with the required `_key`s. */
function ptParagraph(text: string, key: string) {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${key}-s`, text, marks: [] }],
  };
}

/** Portable text from an array of paragraph strings. */
function portableText(paragraphs: string[], prefix: string) {
  return paragraphs.map((text, i) => ptParagraph(text, `${prefix}-${i}`));
}

/**
 * translation.metadata reference item, matching the shape the
 * @sanity/document-internationalization plugin creates (see its
 * `createReference`): a keyed `internationalizedArrayReferenceValue` carrying a
 * `language` field and a weak reference that strengthens on publish.
 */
function translationRef(language: string, id: string, type: string) {
  return {
    _key: language,
    _type: "internationalizedArrayReferenceValue",
    language,
    value: {
      _type: "reference",
      _ref: id,
      _weak: true,
      _strengthenOnPublish: { type },
    },
  };
}

function translationMetadata(
  id: string,
  type: string,
  noId: string,
  enId: string,
): SanityDoc {
  return {
    _id: id,
    _type: "translation.metadata",
    schemaTypes: [type],
    translations: [translationRef("no", noId, type), translationRef("en", enId, type)],
  };
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

const MEDIA: Record<string, MediaSpec> = {
  // Flamenco shoes & dress detail — About section + gallery slot 3.
  shoes: {
    filename: "flamenco-shoes-dress.jpg",
    url: "https://images.unsplash.com/photo-1504609774514-cbcebc7c68b7?q=80&w=2070&auto=format&fit=crop",
    kind: "image",
  },
  // Portrait — Pedagog (Danitza) + gallery slot 4.
  portrait: {
    filename: "flamenco-portrait.jpg",
    url: "https://images.unsplash.com/photo-1546427660-eb346c344ba5?q=80&w=1974&auto=format&fit=crop",
    kind: "image",
  },
  // Dancer with fan — gallery slot 1 (large).
  fan: {
    filename: "flamenco-dancer-fan.jpg",
    url: "https://images.unsplash.com/photo-1533614767277-ea7d48fb47c0?q=80&w=1600&auto=format&fit=crop",
    kind: "image",
  },
  // Spanish guitar detail — gallery slot 2.
  guitar: {
    filename: "spanish-guitar.jpg",
    url: "https://images.unsplash.com/photo-1511222449225-188806202952?q=80&w=1200&auto=format&fit=crop",
    kind: "image",
  },
  // Hero background video.
  heroVideo: {
    filename: "flamenco-hero.mp4",
    url: "https://cdn.magicpatterns.com/uploads/dt9vniBT7UzxiK1P7B7mXb/Make_me_a_video_of_a_female_fl.mp4",
    kind: "file",
  },
};

/**
 * Resolve every media spec to a Sanity asset `_id`. In dry-run mode returns
 * deterministic placeholder ids without touching the network. In real mode
 * downloads each file, dedupes against an existing asset with the same
 * `originalFilename`, and uploads if missing.
 */
async function resolveAssets(
  client: { assets: { upload: (...args: unknown[]) => Promise<{ _id: string }> }; fetch: (q: string, p: Record<string, unknown>) => Promise<{ _id: string } | null> } | null,
): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};
  for (const [key, spec] of Object.entries(MEDIA)) {
    if (DRY_RUN || !client) {
      const prefix = spec.kind === "image" ? "image" : "file";
      ids[key] = `${prefix}-DRYRUN-${key}`;
      continue;
    }
    const assetType = spec.kind === "image" ? "sanity.imageAsset" : "sanity.fileAsset";
    const existing = await client.fetch(
      `*[_type == $t && originalFilename == $fn][0]{_id}`,
      { t: assetType, fn: spec.filename },
    );
    if (existing?._id) {
      console.log(`  ↺ reusing ${spec.kind} asset ${spec.filename} (${existing._id})`);
      ids[key] = existing._id;
      continue;
    }
    console.log(`  ↓ downloading ${spec.url}`);
    const res = await fetch(spec.url);
    if (!res.ok) throw new Error(`Failed to download ${spec.url}: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const uploaded = await client.assets.upload(spec.kind, buffer, {
      filename: spec.filename,
    });
    console.log(`  ↑ uploaded ${spec.filename} (${uploaded._id})`);
    ids[key] = uploaded._id;
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Content data (NO = verbatim from design-reference/, EN = translations)
// ---------------------------------------------------------------------------

interface ClassSpec {
  id: string;
  no: { name: string; level: string };
  en: { name: string; level: string };
  day: string; // lowercase mandag..søndag
  startTime: string;
  endTime: string;
}

const CLASSES: ClassSpec[] = [
  {
    id: "nybegynner",
    no: { name: "Nybegynner", level: "Nivå 1" },
    en: { name: "Beginner", level: "Level 1" },
    day: "mandag",
    startTime: "17:30",
    endTime: "18:45",
  },
  {
    id: "teknikk",
    no: { name: "Teknikk & Koreografi", level: "Litt øvet" },
    en: { name: "Technique & Choreography", level: "Some experience" },
    day: "mandag",
    startTime: "19:00",
    endTime: "20:30",
  },
  {
    id: "viderekommende",
    no: { name: "Viderekommende", level: "Nivå 3" },
    en: { name: "Intermediate", level: "Level 3" },
    day: "tirsdag",
    startTime: "18:00",
    endTime: "19:30",
  },
  {
    id: "batadecola",
    no: { name: "Bata de Cola", level: "Åpent nivå" },
    en: { name: "Bata de Cola", level: "Open level" },
    day: "tirsdag",
    startTime: "19:30",
    endTime: "21:00",
  },
  {
    id: "fitness",
    no: { name: "Flamenco Fitness", level: "Alle" },
    en: { name: "Flamenco Fitness", level: "All levels" },
    day: "torsdag",
    startTime: "17:00",
    endTime: "18:00",
  },
  {
    id: "kompani",
    no: { name: "Kompani Trening", level: "Avansert" },
    en: { name: "Company Training", level: "Advanced" },
    day: "torsdag",
    startTime: "18:15",
    endTime: "20:15",
  },
];

interface PlanSpec {
  id: string;
  price: string;
  no: { title: string; period: string; features: string[] };
  en: { title: string; period: string; features: string[] };
  highlighted?: boolean;
  highlightLabel?: { no: string; en: string };
}

const PLANS: PlanSpec[] = [
  {
    id: "dropin",
    price: "250,-",
    no: {
      title: "Drop-in",
      period: "per klasse",
      features: [
        "Fleksibel deltakelse",
        "Gjelder alle åpne klasser",
        "Ingen bindingstid",
        "Betales via Vipps ved oppmøte",
      ],
    },
    en: {
      title: "Drop-in",
      period: "per class",
      features: [
        "Flexible attendance",
        "Valid for all open classes",
        "No commitment",
        "Paid via Vipps on arrival",
      ],
    },
  },
  {
    id: "semester",
    price: "3200,-",
    no: {
      title: "Semesterkort",
      period: "per semester",
      features: [
        "1 fast klasse per uke",
        "Garantert plass",
        "15 uker undervisning",
        "Mulighet for å ta igjen tapte timer",
      ],
    },
    en: {
      title: "Semester Pass",
      period: "per semester",
      features: [
        "One fixed class per week",
        "Guaranteed spot",
        "15 weeks of tuition",
        "Option to make up missed classes",
      ],
    },
    highlighted: true,
    highlightLabel: { no: "Mest Populær", en: "Most Popular" },
  },
  {
    id: "klippekort",
    price: "2200,-",
    no: {
      title: "Klippekort",
      period: "10 klipp",
      features: [
        "Gyldig i 6 måneder",
        "Bruk på valgfrie klasser",
        "Perfekt for skiftarbeidere",
        "Kan deles med en venn",
      ],
    },
    en: {
      title: "Class Card",
      period: "10 clips",
      features: [
        "Valid for 6 months",
        "Use on any class",
        "Perfect for shift workers",
        "Shareable with a friend",
      ],
    },
  },
];

interface NewsSpec {
  id: string;
  date: string;
  featured?: boolean;
  no: { title: string; slug: string; excerpt: string; body: string[] };
  en: { title: string; slug: string; excerpt: string; body: string[] };
}

const NEWS: NewsSpec[] = [
  {
    id: "oppstart",
    date: "2026-08-19",
    featured: true,
    no: {
      title: "Flamenco Talento starter opp igjen",
      slug: "flamenco-talento-starter-opp-igjen",
      excerpt:
        "Hjertelig velkommen til et nytt og spennende semester! Vi gleder oss til å se både gamle og nye fjes i studio. Tirsdag 19. august braker det løs.",
      body: [
        "Hjertelig velkommen til et nytt og spennende semester! Vi gleder oss til å se både gamle og nye fjes i studio. Tirsdag 19. august braker det løs med fullt program for alle nivåer.",
        "Enten du har danset flamenco i årevis eller aldri har satt en fot i studio før, er du hjertelig velkommen. Meld deg på en klasse, eller stikk innom en drop-in for å kjenne på rytmen. Vi sees på dansegulvet!",
      ],
    },
    en: {
      title: "Flamenco Talento starts up again",
      slug: "flamenco-talento-starts-up-again",
      excerpt:
        "A warm welcome to a new and exciting semester! We can't wait to see both familiar and new faces in the studio. It all kicks off on Tuesday 19 August.",
      body: [
        "A warm welcome to a new and exciting semester! We can't wait to see both familiar and new faces in the studio. It all kicks off on Tuesday 19 August with a full programme for every level.",
        "Whether you have danced flamenco for years or have never set foot in a studio before, you are warmly welcome. Sign up for a class, or drop in to feel the rhythm for yourself. See you on the dance floor!",
      ],
    },
  },
  {
    id: "workshop",
    date: "2026-09-12",
    no: {
      title: "Workshop med gjestepedagog",
      slug: "workshop-med-gjestepedagog",
      excerpt:
        "Vi får besøk direkte fra Sevilla for en intensiv helgeworkshop med fokus på bulerías.",
      body: [
        "Vi får besøk direkte fra Sevilla for en intensiv helgeworkshop med fokus på bulerías. Dette er en unik sjanse til å lære av en av Andalucías fremste utøvere.",
        "Workshopen passer for viderekomne og avanserte dansere. Antall plasser er begrenset, så vær tidlig ute med påmeldingen. Detaljert program og påmelding kommer snart.",
      ],
    },
    en: {
      title: "Workshop with a guest teacher",
      slug: "workshop-with-a-guest-teacher",
      excerpt:
        "We welcome a guest straight from Seville for an intensive weekend workshop focused on bulerías.",
      body: [
        "We welcome a guest straight from Seville for an intensive weekend workshop focused on bulerías. This is a rare chance to learn from one of Andalusia's foremost performers.",
        "The workshop is aimed at intermediate and advanced dancers. Places are limited, so sign up early. A detailed programme and registration will follow shortly.",
      ],
    },
  },
  {
    id: "hostforestilling",
    date: "2026-10-05",
    no: {
      title: "Høstforestilling planlegges",
      slug: "hostforestilling-planlegges",
      excerpt:
        "Sett av datoen for årets store elevforestilling. Mer informasjon om billetter kommer snart.",
      body: [
        "Sett av datoen for årets store elevforestilling. Etter et semester med hardt arbeid får elevene endelig vise fram det de har lært, på en ekte flamencoscene.",
        "Forestillingen er høydepunktet i skoleåret, med musikk, sang og dans i beste andalusiske ånd. Mer informasjon om dato, sted og billetter kommer snart – følg med!",
      ],
    },
    en: {
      title: "Autumn performance in the works",
      slug: "autumn-performance-in-the-works",
      excerpt:
        "Save the date for this year's big student showcase. More information about tickets is coming soon.",
      body: [
        "Save the date for this year's big student showcase. After a semester of hard work, our students finally get to show what they have learned on a real flamenco stage.",
        "The performance is the highlight of the school year, with music, song and dance in the finest Andalusian spirit. More details on date, venue and tickets are coming soon – stay tuned!",
      ],
    },
  },
];

interface GallerySpec {
  id: string;
  asset: keyof typeof MEDIA;
  alt: string;
  size: "large" | "small" | "wide";
  sortOrder: number;
}

const GALLERY: GallerySpec[] = [
  { id: "0", asset: "fan", alt: "Flamencodanser med vifte", size: "large", sortOrder: 0 },
  { id: "1", asset: "guitar", alt: "Detalj av spansk gitar", size: "small", sortOrder: 1 },
  { id: "2", asset: "shoes", alt: "Flamencosko og kjole", size: "small", sortOrder: 2 },
  { id: "3", asset: "portrait", alt: "Flamencoportrett", size: "wide", sortOrder: 3 },
];

const TEACHER_BIO_NO = [
  "Danitza har ledet Flamenco Talento siden oppstarten i 2005. Med en dyp lidenskap for den andalusiske kulturen, har hun dedikert sitt liv til å formidle flamencoens kraft og eleganse til norske elever.",
  "Hennes undervisning kjennetegnes av en unik evne til å kombinere streng teknisk trening med fokus på det personlige uttrykket. Hun har utdannet seg hos anerkjente mestere i Spania og bringer den autentiske flamencofølelsen direkte inn i dansestudioet.",
  '"For meg handler ikke flamenco bare om trinn, men om å finne sin egen stemme gjennom bevegelse og rytme," sier Danitza.',
];

const TEACHER_BIO_EN = [
  "Danitza has led Flamenco Talento since it opened in 2005. With a deep passion for Andalusian culture, she has dedicated her life to sharing the power and elegance of flamenco with Norwegian students.",
  "Her teaching is marked by a rare ability to combine rigorous technical training with a focus on personal expression. She trained under renowned masters in Spain and brings the authentic feeling of flamenco straight into the studio.",
  '"For me, flamenco is not just about steps, but about finding your own voice through movement and rhythm," says Danitza.',
];

const MARQUEE_WORDS = ["PASIÓN", "DUENDE", "COMPÁS", "TACONEO", "ARTE", "FLAMENCO", "ALMA", "FUERZA"];

const ABOUT_QUOTE =
  "I flamencoen ligger følelsene utenpå det estetiske. Derfor avhenger forståelsen og utøvelsen av sensibiliteten.";
const ABOUT_QUOTE_EN =
  "In flamenco the emotions lie on the surface of the aesthetic. That is why understanding and performance depend on sensibility.";

// ---------------------------------------------------------------------------
// Document builders
// ---------------------------------------------------------------------------

type Lang = "no" | "en";

function buildDocuments(assets: Record<string, string>): SanityDoc[] {
  const docs: SanityDoc[] = [];

  // --- classItems ---
  CLASSES.forEach((c, i) => {
    (["no", "en"] as Lang[]).forEach((lang) => {
      docs.push({
        _id: `seed-class-${c.id}-${lang}`,
        _type: "classItem",
        name: c[lang].name,
        level: c[lang].level,
        day: c.day,
        startTime: c.startTime,
        endTime: c.endTime,
        sortOrder: i,
        language: lang,
      });
    });
  });

  // --- pricingPlans ---
  PLANS.forEach((p, i) => {
    (["no", "en"] as Lang[]).forEach((lang) => {
      docs.push({
        _id: `seed-plan-${p.id}-${lang}`,
        _type: "pricingPlan",
        title: p[lang].title,
        price: p.price,
        period: p[lang].period,
        features: p[lang].features,
        highlighted: p.highlighted ?? false,
        ...(p.highlightLabel ? { highlightLabel: p.highlightLabel[lang] } : {}),
        sortOrder: i,
        language: lang,
      });
    });
  });

  // --- newsPosts ---
  NEWS.forEach((n) => {
    (["no", "en"] as Lang[]).forEach((lang) => {
      docs.push({
        _id: `seed-news-${n.id}-${lang}`,
        _type: "newsPost",
        title: n[lang].title,
        slug: { _type: "slug", current: n[lang].slug },
        date: n.date,
        excerpt: n[lang].excerpt,
        featured: n.featured ?? false,
        body: portableText(n[lang].body, `news-${n.id}-${lang}`),
        language: lang,
      });
    });
  });

  // --- galleryImages (not translated) ---
  GALLERY.forEach((g) => {
    docs.push({
      _id: `seed-gallery-${g.id}`,
      _type: "galleryImage",
      image: imageValue(assets[g.asset]),
      alt: g.alt,
      size: g.size,
      sortOrder: g.sortOrder,
    });
  });

  // --- teacher ---
  docs.push({
    _id: "seed-teacher-danitza-no",
    _type: "teacher",
    name: "Danitza Madeleine Rogers Olea",
    role: "Kunstnerisk Leder & Hovedpedagog",
    image: imageValue(assets.portrait),
    bio: portableText(TEACHER_BIO_NO, "teacher-bio-no"),
    language: "no",
  });
  docs.push({
    _id: "seed-teacher-danitza-en",
    _type: "teacher",
    name: "Danitza Madeleine Rogers Olea",
    role: "Artistic Director & Head Teacher",
    image: imageValue(assets.portrait),
    bio: portableText(TEACHER_BIO_EN, "teacher-bio-en"),
    language: "en",
  });

  // --- siteSettings ---
  const navNo = [
    { label: "Hjem", href: "#hjem" },
    { label: "Om oss", href: "#om" },
    { label: "Pedagog", href: "#pedagog" },
    { label: "Timeplan", href: "#timeplan" },
    { label: "Pris", href: "#pris" },
    { label: "Galleri", href: "#galleri" },
    { label: "Nyheter", href: "#nyheter" },
  ];
  const navEn = [
    { label: "Home", href: "#hjem" },
    { label: "About", href: "#om" },
    { label: "Teacher", href: "#pedagog" },
    { label: "Schedule", href: "#timeplan" },
    { label: "Pricing", href: "#pris" },
    { label: "Gallery", href: "#galleri" },
    { label: "News", href: "#nyheter" },
  ];
  const navLinks = (items: { label: string; href: string }[]) =>
    items.map((it, i) => ({ _type: "navLink", _key: `nav-${i}`, ...it }));

  // The NO siteSettings _id MUST be exactly "siteSettings" (the desk structure
  // pins S.editor().documentId("siteSettings")).
  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    navLinks: navLinks(navNo),
    contactPhone: "412 88 996",
    contactEmail: "danitza@flamenco-talento.no",
    accountNumber: "6524 10 66627",
    footerTagline: ABOUT_QUOTE,
    footerCopyrightName: "Flamenco Talento",
    language: "no",
  });
  docs.push({
    _id: "siteSettings-en",
    _type: "siteSettings",
    navLinks: navLinks(navEn),
    contactPhone: "412 88 996",
    contactEmail: "danitza@flamenco-talento.no",
    accountNumber: "6524 10 66627",
    footerTagline: ABOUT_QUOTE_EN,
    footerCopyrightName: "Flamenco Talento",
    language: "en",
  });

  // --- front page ---
  const heroCommon = {
    _type: "heroBlock",
    _key: "hero",
    headingLine1: "FLAMENCO",
    headingLine2: "TALENTO",
    video: fileValue(assets.heroVideo),
  };
  const marquee = { _type: "marqueeBlock", _key: "marquee", words: MARQUEE_WORDS };

  const classRefs = (lang: Lang) =>
    CLASSES.map((c) => refItem(`seed-class-${c.id}-${lang}`, `cls-${c.id}`));
  const planRefs = (lang: Lang) =>
    PLANS.map((p) => refItem(`seed-plan-${p.id}-${lang}`, `plan-${p.id}`));
  const galleryRefs = GALLERY.map((g) => refItem(`seed-gallery-${g.id}`, `img-${g.id}`));

  docs.push({
    _id: "seed-page-front-no",
    _type: "page",
    title: "Forside",
    slug: { _type: "slug", current: "forside" },
    isFrontPage: true,
    language: "no",
    seoDescription:
      "Flamenco Talento – flamencoskole i hjertet av Norge siden 2005. Undervisning for alle nivåer, fra nybegynner til avansert.",
    blocks: [
      {
        ...heroCommon,
        eyebrow: "Etablert 2005",
        tagline:
          "Opplev lidenskapen, rytmen og kraften i autentisk flamenco i hjertet av Norge.",
        primaryCta: { label: "Meld deg på", href: "#kontakt" },
        secondaryCta: { label: "Les mer", href: "#om" },
      },
      marquee,
      {
        _type: "aboutBlock",
        _key: "about",
        heading: "Om",
        headingAccent: "Skolen",
        image: imageValue(assets.shoes),
        imageAlt: "Flamencosko og kjoledetalj",
        body: portableText(
          [
            "Flamenco Talento ble etablert i 2005 og har siden vært en sentral aktør i det norske flamencemiljøet. Vi tilbyr undervisning av høy kvalitet for alle nivåer, med fokus på både teknikk og uttrykk.",
          ],
          "about-no",
        ),
        quote: ABOUT_QUOTE,
      },
      {
        _type: "pedagogBlock",
        _key: "pedagog",
        heading: "Vår",
        headingAccent: "Pedagog",
        teacher: ref("seed-teacher-danitza-no"),
      },
      {
        _type: "timeplanBlock",
        _key: "timeplan",
        heading: "Høstens",
        headingAccent: "Timeplan",
        intro:
          "Finn klassen som passer for deg. Vi tilbyr undervisning for alle nivåer, fra helt nybegynner til avansert.",
        locationNote: "Alle klasser holdes i våre lokaler i Oslo sentrum.",
        classes: classRefs("no"),
      },
      {
        _type: "prisBlock",
        _key: "pris",
        heading: "Priser &",
        headingAccent: "Påmelding",
        plans: planRefs("no"),
        ctaLabelPrefix: "Velg",
      },
      {
        _type: "galleryBlock",
        _key: "gallery",
        heading: "Flamenco",
        headingAccent: "Kunst",
        intro: "Et visuelt innblikk i flamencoens lidenskap, detaljer og estetikk.",
        images: galleryRefs,
      },
      {
        _type: "nyheterBlock",
        _key: "nyheter",
        heading: "Siste",
        headingAccent: "Nytt",
        seeAllLabel: "Se alle nyheter",
        count: 3,
      },
      {
        _type: "signupFormBlock",
        _key: "signupForm",
        heading: "Meld deg",
        headingAccent: "på",
        intro:
          "Klar til å ta det første steget? Fyll ut skjemaet under, så tar vi kontakt for å finne klassen som passer deg.",
        successMessage:
          "Tusen takk! Vi har mottatt påmeldingen din og tar kontakt så snart som mulig. ¡Bienvenido!",
      },
    ],
  });

  docs.push({
    _id: "seed-page-front-en",
    _type: "page",
    title: "Home",
    slug: { _type: "slug", current: "home" },
    isFrontPage: true,
    language: "en",
    seoDescription:
      "Flamenco Talento – a flamenco school in the heart of Norway since 2005. Tuition for all levels, from beginner to advanced.",
    blocks: [
      {
        ...heroCommon,
        eyebrow: "Established 2005",
        tagline:
          "Experience the passion, rhythm and power of authentic flamenco in the heart of Norway.",
        primaryCta: { label: "Sign up", href: "#kontakt" },
        secondaryCta: { label: "Read more", href: "#om" },
      },
      marquee,
      {
        _type: "aboutBlock",
        _key: "about",
        heading: "About",
        headingAccent: "the School",
        image: imageValue(assets.shoes),
        imageAlt: "Flamenco shoes and dress detail",
        body: portableText(
          [
            "Flamenco Talento was founded in 2005 and has since been a central force in the Norwegian flamenco community. We offer high-quality tuition for all levels, with a focus on both technique and expression.",
          ],
          "about-en",
        ),
        quote: ABOUT_QUOTE_EN,
      },
      {
        _type: "pedagogBlock",
        _key: "pedagog",
        heading: "Our",
        headingAccent: "Teacher",
        teacher: ref("seed-teacher-danitza-en"),
      },
      {
        _type: "timeplanBlock",
        _key: "timeplan",
        heading: "Autumn",
        headingAccent: "Schedule",
        intro:
          "Find the class that suits you. We offer tuition for all levels, from complete beginner to advanced.",
        locationNote: "All classes are held at our studio in central Oslo.",
        classes: classRefs("en"),
      },
      {
        _type: "prisBlock",
        _key: "pris",
        heading: "Pricing &",
        headingAccent: "Sign-up",
        plans: planRefs("en"),
        ctaLabelPrefix: "Choose",
      },
      {
        _type: "galleryBlock",
        _key: "gallery",
        heading: "Flamenco",
        headingAccent: "Art",
        intro: "A visual glimpse into the passion, detail and aesthetic of flamenco.",
        images: galleryRefs,
      },
      {
        _type: "nyheterBlock",
        _key: "nyheter",
        heading: "Latest",
        headingAccent: "News",
        seeAllLabel: "See all news",
        count: 3,
      },
      {
        _type: "signupFormBlock",
        _key: "signupForm",
        heading: "Sign",
        headingAccent: "up",
        intro:
          "Ready to take the first step? Fill in the form below and we'll be in touch to find the class that suits you.",
        successMessage:
          "Thank you! We've received your sign-up and will get back to you as soon as possible. ¡Bienvenido!",
      },
    ],
  });

  // --- translation.metadata (links NO/EN pairs; galleryImage excluded) ---
  CLASSES.forEach((c) =>
    docs.push(
      translationMetadata(
        `seed-tmeta-class-${c.id}`,
        "classItem",
        `seed-class-${c.id}-no`,
        `seed-class-${c.id}-en`,
      ),
    ),
  );
  PLANS.forEach((p) =>
    docs.push(
      translationMetadata(
        `seed-tmeta-plan-${p.id}`,
        "pricingPlan",
        `seed-plan-${p.id}-no`,
        `seed-plan-${p.id}-en`,
      ),
    ),
  );
  NEWS.forEach((n) =>
    docs.push(
      translationMetadata(
        `seed-tmeta-news-${n.id}`,
        "newsPost",
        `seed-news-${n.id}-no`,
        `seed-news-${n.id}-en`,
      ),
    ),
  );
  docs.push(
    translationMetadata(
      "seed-tmeta-teacher-danitza",
      "teacher",
      "seed-teacher-danitza-no",
      "seed-teacher-danitza-en",
    ),
  );
  docs.push(
    translationMetadata("seed-tmeta-siteSettings", "siteSettings", "siteSettings", "siteSettings-en"),
  );
  docs.push(
    translationMetadata("seed-tmeta-page-front", "page", "seed-page-front-no", "seed-page-front-en"),
  );

  return docs;
}

// ---------------------------------------------------------------------------
// Summary (dry-run)
// ---------------------------------------------------------------------------

function printSummary(docs: SanityDoc[]): void {
  const byType = new Map<string, string[]>();
  for (const d of docs) {
    const list = byType.get(d._type) ?? [];
    list.push(d._id);
    byType.set(d._type, list);
  }
  console.log("\n=== Seed dry-run summary ===");
  console.log(`Total documents: ${docs.length}`);
  console.log(`Media assets: ${Object.keys(MEDIA).length} (${Object.values(MEDIA)
    .map((m) => m.filename)
    .join(", ")})`);
  console.log("");
  const types = [...byType.keys()].sort();
  for (const type of types) {
    const ids = byType.get(type)!;
    console.log(`${type} (${ids.length}):`);
    for (const id of ids) console.log(`  - ${id}`);
  }
  console.log("\nNo network calls were made (--dry-run).");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (DRY_RUN) {
    console.log("Running in --dry-run mode: building documents, no network calls.");
    const assets = await resolveAssets(null);
    const docs = buildDocuments(assets);
    printSummary(docs);
    return;
  }

  // Real run: fail fast on a missing/placeholder project or token.
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || projectId === "placeholder") {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID is missing or still 'placeholder'. " +
        "Create the Sanity project and set a real project id in .env.local before running the seed. " +
        "Use `pnpm seed --dry-run` to verify content without a project.",
    );
  }
  if (!token) {
    throw new Error(
      "SANITY_API_WRITE_TOKEN is missing. Create an Editor token in sanity.io/manage and add it to .env.local.",
    );
  }

  const { writeClient } = await import("../sanity/lib/client");

  console.log("Uploading media assets...");
  const assets = await resolveAssets(writeClient as never);

  const docs = buildDocuments(assets);
  console.log(`Seeding ${docs.length} documents...`);

  // createOrReplace publishes directly (no drafts), which is what we want.
  const tx = docs.reduce((t, doc) => t.createOrReplace(doc), writeClient.transaction());
  await tx.commit();

  console.log(`✓ Seeded ${docs.length} documents and ${Object.keys(MEDIA).length} assets.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
