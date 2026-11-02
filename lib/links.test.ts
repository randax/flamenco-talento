import { describe, expect, it } from "vitest";
import { languageHref, navHref } from "./links";

describe("navHref", () => {
  it("points section anchors at the front page of the current language", () => {
    expect(navHref("#om", "no")).toBe("/no#om");
    expect(navHref("#kontakt", "en")).toBe("/en#kontakt");
  });

  it("leaves page and external links alone", () => {
    expect(navHref("/no/nyheter", "no")).toBe("/no/nyheter");
    expect(navHref("https://instagram.com/x", "no")).toBe("https://instagram.com/x");
  });

  it("sends an empty or bare # link to the front page", () => {
    expect(navHref("#", "en")).toBe("/en");
    expect(navHref(null, "en")).toBe("/en");
  });
});

describe("languageHref", () => {
  it("uses the page's published translation when there is one", () => {
    expect(
      languageHref("/en/nyheter/autumn-performance-in-the-works", "no", {
        no: "/no/nyheter/hostforestilling-planlegges",
      }),
    ).toBe("/no/nyheter/hostforestilling-planlegges");
  });

  it("swaps the locale on routes that exist in every language", () => {
    expect(languageHref("/no", "en")).toBe("/en");
    expect(languageHref("/en/nyheter", "no")).toBe("/no/nyheter");
  });

  it("falls back to the other language's front page for CMS slugs", () => {
    // Slugs differ per language, so a prefix swap would 404.
    expect(languageHref("/en/nyheter/autumn-performance-in-the-works", "no")).toBe("/no");
    expect(languageHref("/en/about", "no", {})).toBe("/no");
  });

  it("keeps the current language's link on the current page", () => {
    expect(languageHref("/en/nyheter/autumn-performance-in-the-works", "en")).toBe(
      "/en/nyheter/autumn-performance-in-the-works",
    );
  });

  it("falls back when the page has no translation in the target language", () => {
    expect(languageHref("/en/about", "no", { en: "/en/about" })).toBe("/no");
  });
});
