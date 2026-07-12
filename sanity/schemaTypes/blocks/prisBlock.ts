import { TagIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const prisBlock = defineType({
  name: "prisBlock",
  title: "Priser",
  type: "object",
  icon: TagIcon,
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
      name: "plans",
      title: "Prisplaner",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "pricingPlan" }] })],
    }),
    defineField({
      name: "ctaLabelPrefix",
      title: "Knappetekst-prefiks",
      description: 'F.eks. "Velg"',
      type: "string",
    }),
  ],
  preview: {
    select: { heading: "heading" },
    prepare({ heading }) {
      return { title: heading || "Priser", subtitle: "Priser" };
    },
  },
});
