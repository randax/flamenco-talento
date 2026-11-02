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

  it("only accepts blocks whose preview has a prepare", () => {
    const selectOnly = defineType({
      name: "selectOnlyBlock",
      type: "object",
      fields: [defineField({ name: "heading", type: "string" })],
      preview: { select: { title: "heading" } },
    });
    // @ts-expect-error a select-only preview would lose the "Skjult" label
    hideable(selectOnly);
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
