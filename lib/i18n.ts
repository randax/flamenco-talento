export const LANGS = ["no", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "no";
export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}

// Open Graph `og:locale` value per language (underscore form).
export const OG_LOCALE: Record<Lang, string> = {
  no: "nb_NO",
  en: "en_GB",
};

// BCP 47 tag per language, used for `Intl` formatting (hyphen form).
export const BCP47: Record<Lang, string> = {
  no: "nb-NO",
  en: "en-GB",
};
