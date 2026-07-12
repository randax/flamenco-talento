import { PlayIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const heroBlock = defineType({
  name: "heroBlock",
  title: "Hero",
  type: "object",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Overtekst",
      description: 'F.eks. "Etablert 2005"',
      type: "string",
    }),
    defineField({
      name: "headingLine1",
      title: "Overskrift, linje 1",
      description: 'F.eks. "FLAMENCO"',
      type: "string",
    }),
    defineField({
      name: "headingLine2",
      title: "Overskrift, linje 2",
      description: 'F.eks. "TALENTO" — vises rødt og i kursiv.',
      type: "string",
    }),
    defineField({
      name: "tagline",
      title: "Undertekst",
      type: "text",
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "file",
      options: { accept: "video/mp4" },
    }),
    defineField({
      name: "poster",
      title: "Plakatbilde",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "primaryCta",
      title: "Primær knapp",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Tekst", type: "string" }),
        defineField({ name: "href", title: "Lenke", type: "string" }),
      ],
    }),
    defineField({
      name: "secondaryCta",
      title: "Sekundær knapp",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Tekst", type: "string" }),
        defineField({ name: "href", title: "Lenke", type: "string" }),
      ],
    }),
  ],
  preview: {
    select: { line1: "headingLine1", line2: "headingLine2" },
    prepare({ line1, line2 }) {
      return { title: "Hero", subtitle: [line1, line2].filter(Boolean).join(" ") };
    },
  },
});
