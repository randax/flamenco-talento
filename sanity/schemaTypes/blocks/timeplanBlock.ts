import { CalendarIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const timeplanBlock = defineType({
  name: "timeplanBlock",
  title: "Timeplan",
  type: "object",
  icon: CalendarIcon,
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
      name: "intro",
      title: "Ingress",
      type: "text",
    }),
    defineField({
      name: "locationNote",
      title: "Lokasjonsnotat",
      type: "string",
    }),
    defineField({
      name: "classes",
      title: "Klasser",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "classItem" }] })],
    }),
  ],
  preview: {
    select: { heading: "heading" },
    prepare({ heading }) {
      return { title: heading || "Timeplan", subtitle: "Timeplan" };
    },
  },
});
