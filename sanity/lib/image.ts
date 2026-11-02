import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageCrop, SanityImageHotspot, SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(image: SanityImageSource) {
  return builder.image(image);
}

/**
 * CSS `object-position` that keeps an editor's hotspot in view when the image
 * fills a box with `object-cover`. `urlFor` serves the cropped image, so the
 * hotspot (stored relative to the original) is re-measured inside the crop.
 */
export function hotspotPosition(image: {
  hotspot?: SanityImageHotspot | null;
  crop?: SanityImageCrop | null;
}): string {
  const { hotspot, crop } = image;
  if (!hotspot) return "50% 50%";
  const c = crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const axis = (value: number, start: number, end: number) => {
    const span = 1 - start - end;
    const relative = span > 0 ? (value - start) / span : 0.5;
    return `${Math.round(Math.min(1, Math.max(0, relative)) * 1000) / 10}%`;
  };
  return `${axis(hotspot.x, c.left, c.right)} ${axis(hotspot.y, c.top, c.bottom)}`;
}
