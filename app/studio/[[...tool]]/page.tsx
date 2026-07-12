import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

// Note: with Cache Components enabled (next.config.ts), the App Router no
// longer accepts `export const dynamic = "force-static"` here. The embedded
// Studio is a fully client-side SPA (`next-sanity/studio` is a client
// component), so it renders correctly from the default static shell.
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
