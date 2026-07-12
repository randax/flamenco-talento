import {
  CalendarIcon,
  CogIcon,
  DocumentIcon,
  DocumentTextIcon,
  ImagesIcon,
  InboxIcon,
  TagIcon,
  UserIcon,
} from "@sanity/icons";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Innhold")
    .items([
      S.documentTypeListItem("page").title("Sider").icon(DocumentIcon),
      S.documentTypeListItem("newsPost").title("Nyheter").icon(DocumentTextIcon),
      S.documentTypeListItem("classItem").title("Timeplan").icon(CalendarIcon),
      S.documentTypeListItem("pricingPlan").title("Priser").icon(TagIcon),
      S.documentTypeListItem("galleryImage").title("Galleri").icon(ImagesIcon),
      S.documentTypeListItem("teacher").title("Pedagog").icon(UserIcon),
      S.listItem()
        .title("Innstillinger")
        .icon(CogIcon)
        .child(
          S.editor()
            .id("siteSettings")
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.divider(),
      S.listItem()
        .title("Påmeldinger")
        .icon(InboxIcon)
        .child(
          S.documentTypeList("submission")
            .title("Påmeldinger")
            .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
        ),
    ]);

/**
 * Document types that should never appear in the default document type list
 * (e.g. reachable via search/create-new), because they're managed via a
 * fixed structure entry above (siteSettings, submission) or are internal to
 * the i18n plugin (translation.metadata).
 */
export const DEFAULT_LIST_HIDDEN_TYPES = ["submission", "translation.metadata", "siteSettings"];
