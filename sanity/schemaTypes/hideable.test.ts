import { describe, expect, it } from "vitest";
import { defineField, defineType } from "sanity";
import { hideable } from "./hideable";

const block = hideable(
  defineType({
    name: "exampleBlock",
    title: "Example",
    type: "object",
    fields: [defineField({ name: "heading", type: "string" })],
    preview: {
      select: { heading: "heading" },
      prepare: ({ heading }) => ({ title: heading, subtitle: "Eksempel" }),
    },
  }),
);

const preview = (value: Record<string, unknown>) => block.preview!.prepare!(value);

describe("hideable", () => {
  it("adds a boolean hidden field that defaults to off", () => {
    expect(block.fields.find((f) => f.name === "hidden")).toMatchObject({
      type: "boolean",
      initialValue: false,
    });
  });

  it("keeps the block's own fields", () => {
    expect(block.fields.map((f) => f.name)).toContain("heading");
  });

  it("selects the hidden flag for the preview", () => {
    expect(block.preview!.select).toEqual({ heading: "heading", hidden: "hidden" });
  });

  it("marks hidden blocks as Skjult in the preview", () => {
    expect(preview({ heading: "Hei", hidden: true })).toEqual({
      title: "Hei",
      subtitle: "Skjult · Eksempel",
    });
  });

  it("leaves visible blocks' preview unchanged", () => {
    expect(preview({ heading: "Hei", hidden: false })).toEqual({
      title: "Hei",
      subtitle: "Eksempel",
    });
  });

  it("leaves Sanity's default preview alone for blocks without one", () => {
    const plain = hideable(
      defineType({
        name: "plainBlock",
        type: "object",
        fields: [defineField({ name: "heading", type: "string" })],
      }),
    );
    expect(plain.preview).toBeUndefined();
    expect(plain.fields.map((f) => f.name)).toEqual(["hidden", "heading"]);
  });

  it("shows just Skjult when the block has no subtitle", () => {
    const bare = hideable(
      defineType({
        name: "bareBlock",
        type: "object",
        fields: [defineField({ name: "heading", type: "string" })],
        preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title }) },
      }),
    );
    expect(bare.preview!.prepare!({ title: "Hei", hidden: true })).toEqual({
      title: "Hei",
      subtitle: "Skjult",
    });
  });
});
