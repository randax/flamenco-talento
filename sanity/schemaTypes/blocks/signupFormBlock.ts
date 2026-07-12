import { EnvelopeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const signupFormBlock = defineType({
  name: "signupFormBlock",
  title: "Påmeldingsskjema",
  type: "object",
  icon: EnvelopeIcon,
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
      name: "successMessage",
      title: "Bekreftelsesmelding",
      type: "text",
    }),
  ],
  preview: {
    select: { heading: "heading" },
    prepare({ heading }) {
      return { title: heading || "Påmeldingsskjema", subtitle: "Påmeldingsskjema" };
    },
  },
});
