import type { SanityImageSource } from "@sanity/image-url";
import type { PortableTextBlock } from "@portabletext/types";

export type ImageDimensions = {
  width?: number | null;
  height?: number | null;
  aspectRatio?: number | null;
};

// Data shapes as returned by PAGE_QUERY / FRONT_PAGE_QUERY (see
// sanity/lib/queries.ts). References are expanded inline by BLOCKS_PROJECTION,
// so renderers receive plain data.

export type CtaLink = {
  label?: string | null;
  href?: string | null;
};

export type HeroBlock = {
  _type: "heroBlock";
  _key: string;
  eyebrow?: string | null;
  headingLine1?: string | null;
  headingLine2?: string | null;
  tagline?: string | null;
  videoUrl?: string | null;
  poster?: SanityImageSource | null;
  primaryCta?: CtaLink | null;
  secondaryCta?: CtaLink | null;
};

export type MarqueeBlock = {
  _type: "marqueeBlock";
  _key: string;
  words?: string[] | null;
};

export type AboutBlock = {
  _type: "aboutBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
  image?: (SanityImageSource & { dimensions?: ImageDimensions | null }) | null;
  imageAlt?: string | null;
  body?: PortableTextBlock[] | null;
  quote?: string | null;
};

export type Teacher = {
  name?: string | null;
  role?: string | null;
  image?: SanityImageSource | null;
  bio?: PortableTextBlock[] | null;
};

export type PedagogBlock = {
  _type: "pedagogBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
  teacher?: Teacher | null;
};

export type ClassItem = {
  _id: string;
  name?: string | null;
  day?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  level?: string | null;
  sortOrder?: number | null;
};

export type TimeplanBlock = {
  _type: "timeplanBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
  intro?: string | null;
  locationNote?: string | null;
  classes?: ClassItem[] | null;
};

export type PricingPlan = {
  _id: string;
  title?: string | null;
  price?: string | null;
  period?: string | null;
  features?: string[] | null;
  highlighted?: boolean | null;
  highlightLabel?: string | null;
  sortOrder?: number | null;
};

export type PrisBlock = {
  _type: "prisBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
  ctaLabelPrefix?: string | null;
  plans?: PricingPlan[] | null;
};

export type GalleryImage = {
  _id: string;
  image?: SanityImageSource | null;
  alt?: string | null;
  size?: "large" | "wide" | "small" | null;
  sortOrder?: number | null;
};

export type GalleryBlock = {
  _type: "galleryBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
  intro?: string | null;
  images?: GalleryImage[] | null;
};

export type NyheterBlock = {
  _type: "nyheterBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
  seeAllLabel?: string | null;
  count?: number | null;
};

export type NewsPost = {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  date?: string | null;
  excerpt?: string | null;
  featured?: boolean | null;
};

export type SignupFormBlock = {
  _type: "signupFormBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
  intro?: string | null;
  successMessage?: string | null;
};

export type PageBlock =
  | HeroBlock
  | MarqueeBlock
  | AboutBlock
  | PedagogBlock
  | TimeplanBlock
  | PrisBlock
  | GalleryBlock
  | NyheterBlock
  | SignupFormBlock;

export type SiteSettings = {
  navLinks?: { label?: string | null; href?: string | null }[] | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  accountNumber?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  footerTagline?: string | null;
  footerCopyrightName?: string | null;
};
