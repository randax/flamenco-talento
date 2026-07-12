import { defineQuery } from "next-sanity";

// Blocks expand their references inline so renderers get plain data instead
// of having to dereference themselves.
const BLOCKS_PROJECTION = /* groq */ `
  blocks[]{
    ...,
    _type == "heroBlock" => { "videoUrl": video.asset->url },
    _type == "aboutBlock" => { image{ ..., "dimensions": asset->metadata.dimensions } },
    _type == "pedagogBlock" => { teacher-> },
    _type == "timeplanBlock" => { classes[]-> },
    _type == "prisBlock" => { plans[]-> },
    _type == "galleryBlock" => { images[]-> }
  }
`;

const PAGE_FIELDS = /* groq */ `
  title, seoDescription, "slug": slug.current, language,
  ${BLOCKS_PROJECTION}
`;

export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug && language == $lang][0]{
    ${PAGE_FIELDS}
  }
`);

export const FRONT_PAGE_QUERY = defineQuery(`
  *[_type == "page" && isFrontPage == true && language == $lang][0]{
    ${PAGE_FIELDS}
  }
`);

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && language == $lang][0]
`);

// List/latest views only need card fields — `body` is intentionally omitted so
// list responses stay small. `slug` is kept as the raw object because NewsCard
// (and the Nyheter block) read `slug.current`.
const NEWS_CARD_FIELDS = /* groq */ `
  _id, title, slug, date, excerpt, featured
`;

export const NEWS_LIST_QUERY = defineQuery(`
  *[_type == "newsPost" && language == $lang] | order(date desc){
    ${NEWS_CARD_FIELDS}
  }
`);

export const NEWS_POST_QUERY = defineQuery(`
  *[_type == "newsPost" && slug.current == $slug && language == $lang][0]{
    _id, title, "slug": slug.current, date, excerpt, language, body,
    coverImage{ ..., "dimensions": asset->metadata.dimensions }
  }
`);

export const LATEST_NEWS_QUERY = defineQuery(`
  *[_type == "newsPost" && language == $lang] | order(date desc)[0...$count]{
    ${NEWS_CARD_FIELDS}
  }
`);

export const NEWS_SLUGS_QUERY = defineQuery(`
  *[_type == "newsPost" && defined(slug.current)]{
    "slug": slug.current,
    language
  }
`);

export const PAGE_SLUGS_QUERY = defineQuery(`
  *[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    language
  }
`);

// Maps a document _id to its other-language counterparts via the
// `translation.metadata` document that `@sanity/document-internationalization`
// maintains (a `translations` array of keyed references, keyed by language id).
export const TRANSLATIONS_QUERY = defineQuery(`
  *[_type == "translation.metadata" && $id in translations[].value._ref][0]
    .translations[]{
      "language": _key,
      "slug": value->slug.current
    }
`);
