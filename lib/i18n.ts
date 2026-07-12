export const LANGS = ["no", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "no";
export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}
