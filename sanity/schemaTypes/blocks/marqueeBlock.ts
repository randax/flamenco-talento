import { TextIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const marqueeBlock = defineType({
  name: "marqueeBlock",
  title: "Rullende tekst",
  type: "object",
  icon: TextIcon,
  fields: [
    defineField({
      name: "words",
      title: "Ord",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
  ],
  preview: {
    select: { words: "words" },
    prepare({ words }) {
      return { title: "Rullende tekst", subtitle: (words ?? []).join(" · ") };
    },
  },
});
