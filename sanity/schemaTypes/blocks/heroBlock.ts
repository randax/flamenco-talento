import { PlayIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

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
      name: "images",
      title: "Bilder",
      description:
        "Vises i svart-hvitt bak overskriften og glir over i hverandre. Sett fokuspunkt (hotspot) så danseren holdes i bildet. Uten bilder brukes videoen.",
      type: "array",
      options: { layout: "grid" },
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternativ tekst",
              description: "Kort beskrivelse for skjermlesere, f.eks. «Danser i blå kjole på scenen».",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "video",
      title: "Video",
      description: "Brukes bare når det ikke er lagt til bilder.",
      type: "file",
      options: { accept: "video/mp4" },
    }),
    defineField({
      name: "poster",
      title: "Plakatbilde",
      description: "Vises mens videoen lastes.",
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
