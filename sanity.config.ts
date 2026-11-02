"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { defineDocuments, presentationTool } from "sanity/presentation";
import { documentInternationalization } from "@sanity/document-internationalization";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure, DEFAULT_LIST_HIDDEN_TYPES } from "./sanity/structure";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  title: "Flamenco Talento",
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    documentInternationalization({
      supportedLanguages: [
        { id: "no", title: "Norsk" },
        { id: "en", title: "English" },
      ],
      schemaTypes: ["page", "newsPost", "classItem", "pricingPlan", "teacher", "siteSettings"],
    }),
    presentationTool({
      // No `origin`: it defaults to the Studio's own location, which is the
      // site itself since the Studio is embedded at /studio.
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
      // Tells Presentation which document a previewed URL shows, so editors
      // can open it next to the preview. Selecting a document is also what
      // makes Presentation send the draft-edit refreshes the site listens for
      // (components/site/DraftVisualEditing.tsx). Mirrors app/(site)/[lang].
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: "/:lang",
            filter: `_type == "page" && isFrontPage == true && language == $lang`,
          },
          {
            route: "/:lang/nyheter/:slug",
            filter: `_type == "newsPost" && slug.current == $slug && language == $lang`,
          },
          {
            // The news index lists many posts and has no main document.
            // Resolving to nothing (rather than letting the page route below
            // match and find no page) keeps the editor's open document open.
            route: "/:lang/nyheter",
            resolve: () => undefined,
          },
          {
            // `:slug+` spans nested slugs (`/en/classes/beginners`) like the
            // site's [[...slug]] route; Presentation passes repeated params as
            // an array, so join them back into the stored slug.
            route: "/:lang/:slug+",
            filter: `_type == "page" && slug.current == $slug && language == $lang`,
            params: ({ params }) => ({
              lang: params.lang,
              slug: ([] as string[]).concat(params.slug).join("/"),
            }),
          },
        ]),
      },
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter(
          (item) =>
            !DEFAULT_LIST_HIDDEN_TYPES.some(
              (hidden) => item.templateId === hidden || item.templateId.startsWith(`${hidden}-`),
            ),
        );
      }
      return prev;
    },
  },
});
