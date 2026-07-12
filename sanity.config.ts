"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
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
