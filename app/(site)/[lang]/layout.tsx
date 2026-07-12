import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, LANGS } from "@/lib/i18n";
import { sanityFetch, SanityLive, typeTag } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TRPCProvider } from "@/lib/trpc/Provider";
import type { SiteSettings } from "@/components/blocks/types";

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

// `'use cache'` boundary: `sanityFetch` calls `cacheTag()`/`cacheLife()`
// internally, which require Cache Components (see next.config.ts). `lang` is a
// serializable primitive resolved by the caller.
async function fetchSiteSettings(lang: string): Promise<SiteSettings | null> {
  "use cache";
  const { data } = (await sanityFetch({
    query: SITE_SETTINGS_QUERY,
    params: { lang },
    tags: [typeTag("siteSettings")],
  })) as { data: SiteSettings | null };
  return data;
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

  const settings = await fetchSiteSettings(lang);

  return (
    <div className="min-h-screen bg-flamenco-dark text-flamenco-light font-sans selection:bg-flamenco-red selection:text-white">
      <TRPCProvider>
        <Header settings={settings} lang={lang} />
        {children}
        <Footer settings={settings} />
      </TRPCProvider>
      <SanityLive />
    </div>
  );
}
