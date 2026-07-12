import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const classItem = defineType({
  name: "classItem",
  title: "Klasse",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "name",
      title: "Navn",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "day",
      title: "Dag",
      type: "string",
      options: {
        list: [
          { title: "Mandag", value: "mandag" },
          { title: "Tirsdag", value: "tirsdag" },
          { title: "Onsdag", value: "onsdag" },
          { title: "Torsdag", value: "torsdag" },
          { title: "Fredag", value: "fredag" },
          { title: "Lørdag", value: "lørdag" },
          { title: "Søndag", value: "søndag" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startTime",
      title: "Starttid",
      description: 'F.eks. "17:30"',
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endTime",
      title: "Sluttid",
      description: 'F.eks. "18:30"',
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "level",
      title: "Nivå",
      type: "string",
      validation: (Rule) => Rule.required(),
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
    select: { title: "name", day: "day", startTime: "startTime", endTime: "endTime" },
    prepare({ title, day, startTime, endTime }) {
      return { title, subtitle: [day, `${startTime}–${endTime}`].filter(Boolean).join(" · ") };
    },
  },
});
