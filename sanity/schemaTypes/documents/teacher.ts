import { UserIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const teacher = defineType({
  name: "teacher",
  title: "Pedagog",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Navn",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Rolle",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Bilde",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Biografi",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "language",
      title: "Språk",
      type: "string",
      hidden: true,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "image" },
  },
});
