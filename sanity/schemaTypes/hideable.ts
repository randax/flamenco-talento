import {
  defineField,
  type ObjectDefinition,
  type PrepareViewOptions,
  type PreviewValue,
} from "sanity";

const hiddenField = defineField({
  name: "hidden",
  title: "Skjul på nettsiden",
  description: "Blokken beholdes her i Studio, men vises ikke på nettsiden.",
  type: "boolean",
  initialValue: false,
});

/**
 * Gives a page-builder block an on/off switch. Hidden blocks stay in the page's
 * block list (marked "Skjult" in the preview) but are filtered out by the page
 * queries in sanity/lib/queries.ts, so they never reach the site.
 */
export function hideable(block: ObjectDefinition): ObjectDefinition {
  const fields = [hiddenField, ...block.fields];
  // No custom preview: keep Sanity's default rather than replacing it with an empty one.
  if (!block.preview?.prepare) return { ...block, fields };
  const { select = {}, prepare } = block.preview;
  return {
    ...block,
    fields,
    preview: {
      ...block.preview,
      select: { ...select, hidden: "hidden" },
      prepare(value: Record<string, unknown>, viewOptions?: PrepareViewOptions): PreviewValue {
        const { hidden, ...rest } = value;
        const base = prepare(rest, viewOptions);
        if (!hidden) return base;
        const subtitle = ["Skjult", base.subtitle].filter(Boolean).join(" · ");
        return { ...base, subtitle };
      },
    },
  };
}
