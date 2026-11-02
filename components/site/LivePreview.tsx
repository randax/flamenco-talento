import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";

// Cached so reading `draftMode()` doesn't make every page dynamic. Next re-runs
// it on each request while Draft Mode is on. Visitors get `<SanityLive />` for
// published updates; editors in the Presentation tool also get draft events
// and the `<VisualEditing />` bridge Presentation connects to.
export async function LivePreview() {
  "use cache";
  const { isEnabled } = await draftMode();
  return (
    <>
      <SanityLive includeDrafts={isEnabled} />
      {isEnabled && <VisualEditing />}
    </>
  );
}
