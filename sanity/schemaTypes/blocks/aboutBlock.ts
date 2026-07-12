import { InfoOutlineIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const aboutBlock = defineType({
  name: "aboutBlock",
  title: "Om oss",
  type: "object",
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Overskrift",
      type: "string",
    }),
    defineField({
      name: "headingAccent",
      title: "Overskrift, uthevet ord",
      description: "Vises rødt og i kursiv.",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Bilde",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageAlt",
      title: "Alternativ tekst for bilde",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Innhold",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "quote",
      title: "Sitat",
      type: "text",
    }),
  ],
  preview: {
    select: { heading: "heading", accent: "headingAccent", media: "image" },
    prepare({ heading, accent, media }) {
      return { title: [heading, accent].filter(Boolean).join(" "), subtitle: "Om oss", media };
    },
  },
});
