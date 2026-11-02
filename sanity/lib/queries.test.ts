import { describe, expect, it } from "vitest";
import { evaluate, parse } from "groq-js";
import { FRONT_PAGE_QUERY, PAGE_QUERY, PAGE_SLUGS_QUERY } from "./queries";

const dataset = [
  {
    _id: "page-no",
    _type: "page",
    language: "no",
    isFrontPage: true,
    slug: { current: "hjem" },
    title: "Hjem",
    blocks: [
      { _key: "a", _type: "marqueeBlock", words: ["visible"] },
      { _key: "b", _type: "marqueeBlock", words: ["hidden"], hidden: true },
      { _key: "c", _type: "marqueeBlock", words: ["shown"], hidden: false },
      { _key: "d", _type: "marqueeBlock", words: ["null"], hidden: null },
      {
        _key: "e",
        _type: "timeplanBlock",
        hidden: true,
        classes: [{ _key: "r1", _type: "reference", _ref: "class-1" }],
      },
      {
        _key: "f",
        _type: "timeplanBlock",
        classes: [{ _key: "r2", _type: "reference", _ref: "class-1" }],
      },
    ],
  },
  { _id: "class-1", _type: "classItem", name: "Nybegynner" },
  { _id: "page-om", _type: "page", language: "no", slug: { current: "om-oss" }, blocks: [] },
];

async function run(query: string, params: Record<string, unknown>) {
  const result = await evaluate(parse(query), { dataset, params });
  return (await result.get()) as { blocks: { _key: string }[] };
}

describe("page queries", () => {
  it("still expands references on visible blocks", async () => {
    const page = await run(PAGE_QUERY, { slug: "hjem", lang: "no" });
    const timeplan = page.blocks.find((b) => b._key === "f") as { classes?: { name: string }[] };
    expect(timeplan.classes).toEqual([expect.objectContaining({ name: "Nybegynner" })]);
  });

  it("PAGE_QUERY leaves out hidden blocks", async () => {
    const page = await run(PAGE_QUERY, { slug: "hjem", lang: "no" });
    expect(page.blocks.map((b) => b._key)).toEqual(["a", "c", "d", "f"]);
  });

  it("FRONT_PAGE_QUERY leaves out hidden blocks", async () => {
    const page = await run(FRONT_PAGE_QUERY, { lang: "no" });
    expect(page.blocks.map((b) => b._key)).toEqual(["a", "c", "d", "f"]);
  });

  it("PAGE_SLUGS_QUERY leaves out front pages, which live at the locale root", async () => {
    const result = await evaluate(parse(PAGE_SLUGS_QUERY), { dataset });
    expect(await result.get()).toEqual([{ slug: "om-oss", language: "no" }]);
  });

  it("PAGE_QUERY says whether the page is the front page", async () => {
    const page = (await run(PAGE_QUERY, { slug: "hjem", lang: "no" })) as { isFrontPage?: boolean };
    expect(page.isFrontPage).toBe(true);
  });
});
