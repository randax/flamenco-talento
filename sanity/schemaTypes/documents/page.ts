import { DocumentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType, getPublishedId } from "sanity";
import { apiVersion } from "../../env";

export const page = defineType({
  name: "page",
  title: "Side",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL-slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isFrontPage",
      title: "Forside",
      description: "Vis denne siden som forsiden på nettstedet.",
      type: "boolean",
      initialValue: false,
      // A translation is its own page: don't copy the flag when the
      // translation plugin duplicates a front page into another language.
      options: { documentInternationalization: { exclude: true } },
      // One front page per language: the site serves it at /<lang> and
      // redirects its slug there, so two would make /<lang> ambiguous.
      // Checked against drafts, so switching front pages needs no downtime:
      // untick the old one (a draft is enough), publish the new, then publish
      // the old.
      validation: (Rule) =>
        Rule.custom(async (isFrontPage, { document, getClient }) => {
          if (!isFrontPage || !document) return true;
          const other = await getClient({ apiVersion })
            .withConfig({ perspective: "drafts" })
            .fetch<string | null>(
              `*[_type == "page" && isFrontPage == true && language == $lang && _id != $id][0].title`,
              { lang: document.language ?? null, id: getPublishedId(document._id) },
            );
          return other
            ? `«${other}» er allerede forsiden for dette språket. Fjern haken der først (du trenger ikke publisere den endringen før denne).`
            : true;
        }),
    }),
    defineField({
      name: "blocks",
      title: "Innholdsblokker",
      type: "array",
      of: [
        defineArrayMember({ type: "heroBlock" }),
        defineArrayMember({ type: "marqueeBlock" }),
        defineArrayMember({ type: "aboutBlock" }),
        defineArrayMember({ type: "pedagogBlock" }),
        defineArrayMember({ type: "timeplanBlock" }),
        defineArrayMember({ type: "prisBlock" }),
        defineArrayMember({ type: "galleryBlock" }),
        defineArrayMember({ type: "nyheterBlock" }),
        defineArrayMember({ type: "signupFormBlock" }),
      ],
    }),
    defineField({
      name: "seoDescription",
      title: "SEO-beskrivelse",
      type: "text",
    }),
    defineField({
      name: "language",
      title: "Språk",
      type: "string",
      hidden: true,
    }),
  ],
  preview: {
    select: { title: "title", isFrontPage: "isFrontPage", language: "language" },
    prepare({ title, isFrontPage, language }) {
      return {
        title,
        subtitle: [isFrontPage ? "Forside" : null, language].filter(Boolean).join(" · "),
      };
    },
  },
});
