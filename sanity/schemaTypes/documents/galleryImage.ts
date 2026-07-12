import { ImagesIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const galleryImage = defineType({
  name: "galleryImage",
  title: "Galleribilde",
  type: "document",
  icon: ImagesIcon,
  fields: [
    defineField({
      name: "image",
      title: "Bilde",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alternativ tekst",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "size",
      title: "Størrelse",
      description: "Styrer hvor mye plass bildet tar i galleriet.",
      type: "string",
      options: {
        list: [
          { title: "Stor", value: "large" },
          { title: "Bred", value: "wide" },
          { title: "Liten", value: "small" },
        ],
      },
      initialValue: "small",
    }),
    defineField({
      name: "sortOrder",
      title: "Sorteringsrekkefølge",
      type: "number",
    }),
  ],
  preview: {
    select: { title: "alt", media: "image", size: "size" },
    prepare({ title, media, size }) {
      return { title, subtitle: size, media };
    },
  },
});
