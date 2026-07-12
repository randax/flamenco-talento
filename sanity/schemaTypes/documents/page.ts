import { DocumentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Side",
  type: "document",
  icon: DocumentIcon,
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
      name: "isFrontPage",
      title: "Forside",
      description: "Vis denne siden som forsiden på nettstedet.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "blocks",
      title: "Innholdsblokker",
      type: "array",
      of: [
        defineArrayMember({ type: "heroBlock" }),
        defineArrayMember({ type: "marqueeBlock" }),
        defineArrayMember({ type: "aboutBlock" }),
        defineArrayMember({ type: "pedagogBlock" }),
        defineArrayMember({ type: "timeplanBlock" }),
        defineArrayMember({ type: "prisBlock" }),
        defineArrayMember({ type: "galleryBlock" }),
        defineArrayMember({ type: "nyheterBlock" }),
        defineArrayMember({ type: "signupFormBlock" }),
      ],
    }),
    defineField({
      name: "seoDescription",
      title: "SEO-beskrivelse",
      type: "text",
    }),
    defineField({
      name: "language",
      title: "Språk",
      type: "string",
      hidden: true,
    }),
  ],
  preview: {
    select: { title: "title", isFrontPage: "isFrontPage", language: "language" },
    prepare({ title, isFrontPage, language }) {
      return {
        title,
        subtitle: [isFrontPage ? "Forside" : null, language].filter(Boolean).join(" · "),
      };
    },
  },
});
