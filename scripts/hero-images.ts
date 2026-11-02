/**
 * Upload the hero photos from `images/` to Sanity and set them on each front
 * page's hero block (Norwegian and English), replacing any photos already
 * there. The hero video stays as the fallback.
 *
 * Re-runnable: assets are reused when one with the same original filename
 * already exists.
 * Dry run by default (unlike `pnpm seed`) because it writes to the live
 * front pages. `images/` holds the original photos and is not committed.
 * `pnpm seed` replaces the front pages, so re-run this afterwards.
 *
 *   pnpm hero-images          # show what would happen
 *   pnpm hero-images --write  # do it
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "next-sanity";

process.loadEnvFile(resolve(process.cwd(), ".env.local"));

const WRITE = process.argv.includes("--write");

type Lang = "no" | "en";

// In slideshow order. Hotspots keep the dancer in frame (x/y as fractions of
// the photo); editors can move them in the Studio.
const PHOTOS: { file: string; hotspot: { x: number; y: number }; alt: Record<Lang, string> }[] = [
  {
    file: "101.jpg",
    hotspot: { x: 0.45, y: 0.55 },
    alt: { no: "Danser i blå kjole på scenegulv i spotlys", en: "Dancer in a blue dress on a spotlit stage" },
  },
  {
    file: "IMGL3855.jpg",
    hotspot: { x: 0.5, y: 0.5 },
    alt: { no: "Danser virvler et brodert sjal under steinbuer", en: "Dancer swirling an embroidered shawl under stone arches" },
  },
  {
    file: "Oslo Internasjonal Flamenco Festival 2019-8.jpeg.jpg",
    hotspot: { x: 0.52, y: 0.5 },
    alt: { no: "Danser i mønstret kjole mot svart bakgrunn", en: "Dancer in a patterned dress against a black background" },
  },
  {
    file: "IMGL3815.jpg",
    hotspot: { x: 0.5, y: 0.45 },
    alt: { no: "Danser i positur med sjal under steinbuer", en: "Dancer posing with a shawl under stone arches" },
  },
  {
    file: "IMGL3809.jpg",
    hotspot: { x: 0.5, y: 0.45 },
    alt: { no: "Danser holder sjalet høyt under steinbuer", en: "Dancer holding a shawl up under stone arches" },
  },
];

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) {
  throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN in .env.local");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-01", useCdn: false });

async function assetFor(file: string): Promise<string> {
  const existing = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $file][0]._id`,
    { file },
  );
  if (existing) {
    console.log(`  ↺ reusing ${file} (${existing})`);
    return existing;
  }
  if (!WRITE) {
    console.log(`  ↑ would upload ${file}`);
    return `image-DRYRUN-${file}`;
  }
  const asset = await client.assets.upload("image", readFileSync(resolve(process.cwd(), "images", file)), { filename: file });
  console.log(`  ↑ uploaded ${file} (${asset._id})`);
  return asset._id;
}

async function main() {
  console.log(WRITE ? "Uploading and patching…" : "Dry run (pass --write to apply)");
  const assets: string[] = [];
  for (const photo of PHOTOS) assets.push(await assetFor(photo.file));

  const pages = await client.fetch<{ _id: string; language: Lang; heroKey: string | null; hasDraft: boolean }[]>(
    `*[_type == "page" && isFrontPage == true && !(_id in path("drafts.**"))]{
      _id, language,
      "heroKey": blocks[_type == "heroBlock"][0]._key,
      "hasDraft": defined(*[_id == "drafts." + ^._id][0])
    }`,
  );

  for (const page of pages) {
    if (!page.heroKey) {
      console.log(`  – ${page._id}: no hero block, skipped`);
      continue;
    }
    if (page.hasDraft) console.warn(`  ! ${page._id} has an unpublished draft; only the published page is updated`);
    const images = PHOTOS.map((photo, k) => ({
      _key: `photo-${k + 1}`,
      _type: "image",
      asset: { _type: "reference", _ref: assets[k] },
      hotspot: { _type: "sanity.imageHotspot", ...photo.hotspot, width: 0.4, height: 0.4 },
      alt: photo.alt[page.language],
    }));
    const path = `blocks[_key=="${page.heroKey}"].images`;
    if (WRITE) {
      await client.patch(page._id).set({ [path]: images }).commit();
      console.log(`  ✓ ${page._id} (${page.language}): ${images.length} photos`);
    } else {
      console.log(`  · would set ${images.length} photos on ${page._id} (${page.language}) at ${path}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
