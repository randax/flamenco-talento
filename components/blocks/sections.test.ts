import { describe, expect, it } from "vitest";
import { sectionIds } from "./sections";
import type { PageBlock } from "./types";

describe("sectionIds", () => {
  it("lists the anchor ids of the sections a page renders", () => {
    const blocks = [
      { _type: "heroBlock", _key: "a" },
      { _type: "marqueeBlock", _key: "b" },
      { _type: "signupFormBlock", _key: "c" },
    ] as PageBlock[];
    expect(sectionIds(blocks)).toEqual(new Set(["hjem", "kontakt"]));
  });
});
