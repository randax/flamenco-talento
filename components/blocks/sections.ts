import type { PageBlock } from "./types";

// The anchor id each block renders its section under (`#om`, `#kontakt`). Menu
// items and buttons link to these, so the block components and BlockRenderer
// (which works out which sections a page actually has) share this one list.
export const SECTION_ID = {
  heroBlock: "hjem",
  aboutBlock: "om",
  pedagogBlock: "pedagog",
  timeplanBlock: "timeplan",
  prisBlock: "pris",
  galleryBlock: "galleri",
  nyheterBlock: "nyheter",
  signupFormBlock: "kontakt",
} as const satisfies Partial<Record<PageBlock["_type"], string>>;

/** Section ids rendered by these blocks. */
export function sectionIds(blocks: PageBlock[]): Set<string> {
  const ids: Partial<Record<PageBlock["_type"], string>> = SECTION_ID;
  return new Set(blocks.map((block) => ids[block._type]).filter((id): id is string => !!id));
}
