import { describe, expect, it } from "vitest";
import { languageHref, navHref, pagePath } from "./links";

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

  it("normalises anchors editors may type in other forms", () => {
    expect(navHref(" #om ", "no")).toBe("/no#om");
    expect(navHref("/#om", "en")).toBe("/en#om");
  });

  it("makes bare relative paths absolute in the current language", () => {
    // A relative "om" would resolve against nested slugs like /no/kurs/x.
    expect(navHref("om-oss", "no")).toBe("/no/om-oss");
    expect(navHref("mailto:a@b.no", "no")).toBe("mailto:a@b.no");
  });

  it("keeps an anchor on the page when that section is on the page", () => {
    const onPage = new Set(["kontakt"]);
    expect(navHref("#kontakt", "no", onPage)).toBe("#kontakt");
    expect(navHref("#om", "no", onPage)).toBe("/no#om");
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

  it("falls back to the other language's news index for news posts", () => {
    // Post slugs differ per language, so a prefix swap would 404.
    expect(languageHref("/en/nyheter/autumn-performance-in-the-works", "no")).toBe("/no/nyheter");
  });

  it("falls back to the other language's front page for CMS page slugs", () => {
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

describe("pagePath", () => {
  it("serves a front page at the locale root", () => {
    expect(pagePath("en", "home", true)).toBe("/en");
  });

  it("serves other pages at their slug", () => {
    expect(pagePath("no", "om-oss", false)).toBe("/no/om-oss");
    expect(pagePath("no", "om-oss", null)).toBe("/no/om-oss");
  });

  it("has no URL for a page without a slug", () => {
    expect(pagePath("no", null, false)).toBeUndefined();
  });
});
