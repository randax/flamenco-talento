import { aboutBlock } from "./blocks/aboutBlock";
import { galleryBlock } from "./blocks/galleryBlock";
import { heroBlock } from "./blocks/heroBlock";
import { marqueeBlock } from "./blocks/marqueeBlock";
import { nyheterBlock } from "./blocks/nyheterBlock";
import { pedagogBlock } from "./blocks/pedagogBlock";
import { prisBlock } from "./blocks/prisBlock";
import { signupFormBlock } from "./blocks/signupFormBlock";
import { timeplanBlock } from "./blocks/timeplanBlock";
import { classItem } from "./documents/classItem";
import { galleryImage } from "./documents/galleryImage";
import { newsPost } from "./documents/newsPost";
import { page } from "./documents/page";
import { pricingPlan } from "./documents/pricingPlan";
import { siteSettings } from "./documents/siteSettings";
import { submission } from "./documents/submission";
import { teacher } from "./documents/teacher";

export const schemaTypes = [
  // Documents
  page,
  newsPost,
  classItem,
  pricingPlan,
  galleryImage,
  teacher,
  siteSettings,
  submission,
  // Page-builder blocks
  heroBlock,
  marqueeBlock,
  aboutBlock,
  pedagogBlock,
  timeplanBlock,
  prisBlock,
  galleryBlock,
  nyheterBlock,
  signupFormBlock,
];
