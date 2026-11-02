import { describe, expect, it } from "vitest";
import { evaluate, parse } from "groq-js";
import { FRONT_PAGE_QUERY, PAGE_QUERY } from "./queries";

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
    ],
  },
];

async function run(query: string, params: Record<string, unknown>) {
  const result = await evaluate(parse(query), { dataset, params });
  return (await result.get()) as { blocks: { _key: string }[] };
}

describe("page queries", () => {
  it("PAGE_QUERY leaves out hidden blocks", async () => {
    const page = await run(PAGE_QUERY, { slug: "hjem", lang: "no" });
    expect(page.blocks.map((b) => b._key)).toEqual(["a", "c"]);
  });

  it("FRONT_PAGE_QUERY leaves out hidden blocks", async () => {
    const page = await run(FRONT_PAGE_QUERY, { lang: "no" });
    expect(page.blocks.map((b) => b._key)).toEqual(["a", "c"]);
  });
});
