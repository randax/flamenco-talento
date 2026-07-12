import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const nyheterBlock = defineType({
  name: "nyheterBlock",
  title: "Nyheter",
  type: "object",
  icon: DocumentTextIcon,
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
      name: "seeAllLabel",
      title: "Lenketekst for «se alle»",
      type: "string",
    }),
    defineField({
      name: "count",
      title: "Antall nyheter",
      description: "Henter de siste N nyhetene automatisk for sidens språk.",
      type: "number",
      initialValue: 3,
    }),
  ],
  preview: {
    select: { heading: "heading", count: "count" },
    prepare({ heading, count }) {
      return { title: heading || "Nyheter", subtitle: count ? `Viser ${count} siste` : "Nyheter" };
    },
  },
});
