import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const pedagogBlock = defineType({
  name: "pedagogBlock",
  title: "Pedagog",
  type: "object",
  icon: UserIcon,
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
      name: "teacher",
      title: "Pedagog",
      type: "reference",
      to: [{ type: "teacher" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { heading: "heading", teacherName: "teacher.name", media: "teacher.image" },
    prepare({ heading, teacherName, media }) {
      return { title: heading || "Pedagog", subtitle: teacherName, media };
    },
  },
});
