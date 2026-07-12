import { BCP47, type Lang } from "@/lib/i18n";
import { capitalize } from "@/lib/strings";

// Formats a news date as e.g. "19. August" (no) / "19 August" (en). Lives in a
// plain (non-"use client") module so it can be called from both server
// components (the /nyheter detail page) and client components (NewsCard).
export function formatNewsDate(date: string | null | undefined, lang: Lang) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  const formatted = new Intl.DateTimeFormat(BCP47[lang], {
    day: "numeric",
    month: "long",
  }).format(parsed);
  // Capitalize the month word to match the design.
  return formatted.replace(/\p{L}+/u, (word) => capitalize(word));
}
