import type { NewsPost } from "@/components/blocks/types";

// Splits a date-desc-ordered list of posts into the one that fills the large
// "featured" card slot and the remaining cards. A post explicitly flagged
// `featured` wins (newest such if several, since `posts` is already date desc);
// otherwise the newest post falls into the slot. The `rest` keeps date order.
export function splitFeaturedNews(posts: NewsPost[]): {
  featured: NewsPost | undefined;
  rest: NewsPost[];
} {
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const rest = posts.filter((post) => post !== featured);
  return { featured, rest };
}
