import { draftMode } from "next/headers";
import { SanityLive } from "@/sanity/lib/live";
import { DraftVisualEditing } from "./DraftVisualEditing";

// Cached so reading `draftMode()` doesn't make every page dynamic; Next re-runs
// it on each request while Draft Mode is on. Everyone gets `<SanityLive />` for
// published updates. Editors in the Presentation tool also get the
// `<VisualEditing />` bridge, which refreshes the page on each draft edit.
export async function LivePreview() {
  "use cache";
  const { isEnabled } = await draftMode();
  return (
    <>
      <SanityLive />
      {isEnabled && <DraftVisualEditing />}
    </>
  );
}
