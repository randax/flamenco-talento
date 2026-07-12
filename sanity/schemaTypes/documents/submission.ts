import { InboxIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const submission = defineType({
  name: "submission",
  title: "Påmelding",
  type: "document",
  icon: InboxIcon,
  fields: [
    defineField({
      name: "name",
      title: "Navn",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "email",
      title: "E-post",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "phone",
      title: "Telefon",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "interest",
      title: "Interesse",
      description: "Klassen eller prisplanen personen valgte.",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "message",
      title: "Melding",
      type: "text",
      readOnly: true,
    }),
    defineField({
      name: "lang",
      title: "Språk",
      description: "Språket personen brukte da de meldte seg på.",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "createdAt",
      title: "Opprettet",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "handled",
      title: "Behandlet",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "name", interest: "interest", handled: "handled" },
    prepare({ title, interest, handled }) {
      return {
        title: [title, interest].filter(Boolean).join(" – "),
        subtitle: handled ? "Behandlet" : "Ikke behandlet",
      };
    },
  },
});
