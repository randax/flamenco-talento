"use client";

import { startTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { VisualEditing } from "next-sanity/visual-editing";

// Inside the Presentation tool, the Studio reports each draft edit as a
// "mutation" refresh. next-sanity's default handler ignores those (it expects
// `<SanityLive includeDrafts>`, which would ship a read token to the browser),
// so re-render from the server here instead: it fetches drafts with the
// server-only token (see sanity/lib/live.ts).
export function DraftVisualEditing() {
  const router = useRouter();
  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
    // Same settle time next-sanity's default handler gives Presentation.
    return new Promise<void>((resolve) => setTimeout(resolve, 1000));
  }, [router]);
  return <VisualEditing refresh={refresh} />;
}
