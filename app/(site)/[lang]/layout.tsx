import { notFound } from "next/navigation";
import { isLang, LANGS } from "@/lib/i18n";
import { sanityFetch, SanityLive, typeTag } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AltHrefProvider } from "@/components/site/AltHrefContext";
import { TRPCProvider } from "@/lib/trpc/Provider";
import type { SiteSettings } from "@/components/blocks/types";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
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
        <AltHrefProvider>
          <Header settings={settings} lang={lang} />
          {children}
          <Footer settings={settings} />
        </AltHrefProvider>
      </TRPCProvider>
      <SanityLive />
    </div>
  );
}
