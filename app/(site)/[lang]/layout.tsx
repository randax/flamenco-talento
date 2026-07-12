import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, isLang } from "@/lib/i18n";
import { SanityLive } from "@/sanity/lib/live";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

// Note: the App Router cannot set the root <html lang> attribute from a
// nested layout (app/layout.tsx owns <html>, and next/root-params requires
// [lang] to be the root segment, which conflicts with the fixed root layout
// used here for fonts). generateMetadata below covers title/description
// overrides; full hreflang alternates + a real <html lang> story land in
// Task 9 alongside metadataBase.
export async function generateMetadata(): Promise<Metadata> {
  return {};
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLang(lang)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-flamenco-dark text-flamenco-light font-sans selection:bg-flamenco-red selection:text-white">
      {children}
      <SanityLive />
    </div>
  );
}
