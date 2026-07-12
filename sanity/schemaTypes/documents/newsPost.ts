import { DocumentTextIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const newsPost = defineType({
  name: "newsPost",
  title: "Nyhet",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL-slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Dato",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Ingress",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Fremhevet",
      type: "boolean",
    }),
    defineField({
      name: "coverImage",
      title: "Toppbilde",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "body",
      title: "Innhold",
      type: "array",
      of: [defineArrayMember({ type: "block" }), defineArrayMember({ type: "image" })],
    }),
    defineField({
      name: "language",
      title: "Språk",
      type: "string",
      hidden: true,
    }),
  ],
  preview: {
    select: { title: "title", date: "date", media: "coverImage" },
    prepare({ title, date, media }) {
      return { title, subtitle: date, media };
    },
  },
});
