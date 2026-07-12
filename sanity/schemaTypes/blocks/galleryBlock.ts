import { ImagesIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const galleryBlock = defineType({
  name: "galleryBlock",
  title: "Galleri",
  type: "object",
  icon: ImagesIcon,
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
      name: "images",
      title: "Bilder",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "galleryImage" }] })],
    }),
  ],
  preview: {
    select: { heading: "heading" },
    prepare({ heading }) {
      return { title: heading || "Galleri", subtitle: "Galleri" };
    },
  },
});
