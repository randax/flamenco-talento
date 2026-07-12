import { CogIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Innstillinger",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "navLinks",
      title: "Navigasjonslenker",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "navLink",
          title: "Navigasjonslenke",
          fields: [
            defineField({ name: "label", title: "Tekst", type: "string" }),
            defineField({ name: "href", title: "Lenke", type: "string" }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        }),
      ],
    }),
    defineField({
      name: "contactPhone",
      title: "Telefon",
      type: "string",
    }),
    defineField({
      name: "contactEmail",
      title: "E-post",
      type: "string",
    }),
    defineField({
      name: "accountNumber",
      title: "Kontonummer",
      type: "string",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook-lenke",
      type: "string",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram-lenke",
      type: "string",
    }),
    defineField({
      name: "footerTagline",
      title: "Footer-slagord",
      type: "text",
    }),
    defineField({
      name: "footerCopyrightName",
      title: "Footer-copyrightnavn",
      type: "string",
    }),
    defineField({
      name: "language",
      title: "Språk",
      type: "string",
      hidden: true,
    }),
  ],
  preview: {
    select: { language: "language" },
    prepare({ language }) {
      return { title: "Innstillinger", subtitle: language };
    },
  },
});
