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
 * Pages whose hero already has photos are left alone, so editors' changes
 * survive a re-run; `--replace` overwrites them. Drafts of the front pages
 * get the photos too.
 *
 *   pnpm hero-images                      # show what would happen
 *   pnpm hero-images --write              # add photos where there are none
 *   pnpm hero-images --write --replace    # overwrite existing photos
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "next-sanity";

process.loadEnvFile(resolve(process.cwd(), ".env.local"));

const WRITE = process.argv.includes("--write");
const REPLACE = process.argv.includes("--replace");

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

// "raw" so drafts are visible too: the API's default perspective for this
// version is "published", which would hide an editor's unpublished draft.
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-01", useCdn: false, perspective: "raw" });

// Matched by content (Sanity's own sha1hash), not filename, so a different
// photo with the same name is never reused and a replaced photo is uploaded.
async function assetFor(file: string): Promise<string> {
  const bytes = readFileSync(resolve(process.cwd(), "images", file));
  const hash = createHash("sha1").update(bytes).digest("hex");
  const existing = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && sha1hash == $hash][0]._id`,
    { hash },
  );
  if (existing) {
    console.log(`  ↺ reusing ${file} (${existing})`);
    return existing;
  }
  if (!WRITE) {
    console.log(`  ↑ would upload ${file}`);
    return `image-DRYRUN-${hash}`;
  }
  const asset = await client.assets.upload("image", bytes, { filename: file });
  console.log(`  ↑ uploaded ${file} (${asset._id})`);
  return asset._id;
}

async function main() {
  console.log(
    WRITE ? `Uploading and patching${REPLACE ? " (replacing existing photos)" : ""}…` : "Dry run (pass --write to apply)",
  );
  const assets: string[] = [];
  for (const photo of PHOTOS) assets.push(await assetFor(photo.file));

  // Published front pages and their drafts, so publishing a draft later
  // doesn't drop the photos.
  const docs = await client.fetch<{ _id: string; _rev: string; language: Lang; heroKey: string | null; photos: number | null }[]>(
    `*[_type == "page" && isFrontPage == true && !(_id in path("versions.**"))]{
      _id, _rev, language,
      "heroKey": blocks[_type == "heroBlock"][0]._key,
      "photos": count(blocks[_type == "heroBlock"][0].images)
    }`,
  );

  const transaction = client.transaction();
  let changes = 0;
  for (const doc of docs) {
    if (!doc.heroKey) {
      console.log(`  – ${doc._id}: no hero block, skipped`);
      continue;
    }
    // Editors may have changed photos, hotspots or alt text since: keep them
    // unless asked to replace.
    if (doc.photos && !REPLACE) {
      console.log(`  – ${doc._id}: already has ${doc.photos} photos, kept (pass --replace to overwrite)`);
      continue;
    }
    const images = PHOTOS.map((photo, k) => ({
      _key: `photo-${k + 1}`,
      _type: "image",
      asset: { _type: "reference", _ref: assets[k] },
      hotspot: { _type: "sanity.imageHotspot", ...photo.hotspot, width: 0.4, height: 0.4 },
      alt: photo.alt[doc.language],
    }));
    // Only if the document hasn't changed since it was read, so an editor's
    // concurrent change is never overwritten (the commit fails instead).
    transaction.patch(doc._id, (patch) =>
      patch.ifRevisionId(doc._rev).set({ [`blocks[_key=="${doc.heroKey}"].images`]: images }),
    );
    changes++;
    console.log(`  ${WRITE ? "✓" : "·"} ${doc._id} (${doc.language}): ${WRITE ? "" : "would set "}${images.length} photos`);
  }
  if (WRITE && changes > 0) {
    await transaction.commit().catch((err: { statusCode?: number }) => {
      if (err.statusCode === 409) throw new Error("A front page changed while this ran; nothing was written. Run it again.");
      throw err;
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
