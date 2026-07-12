import { TagIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const pricingPlan = defineType({
  name: "pricingPlan",
  title: "Pris",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Pris",
      description: 'F.eks. "250,-"',
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "period",
      title: "Periode",
      description: 'F.eks. "per måned"',
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "features",
      title: "Inkluderer",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "highlighted",
      title: "Fremhevet",
      type: "boolean",
    }),
    defineField({
      name: "highlightLabel",
      title: "Fremhevingstekst",
      description: 'F.eks. "Mest Populær"',
      type: "string",
    }),
    defineField({
      name: "sortOrder",
      title: "Sorteringsrekkefølge",
      type: "number",
    }),
    defineField({
      name: "language",
      title: "Språk",
      type: "string",
      hidden: true,
    }),
  ],
  preview: {
    select: { title: "title", price: "price", period: "period" },
    prepare({ title, price, period }) {
      return { title, subtitle: [price, period].filter(Boolean).join(" / ") };
    },
  },
});
