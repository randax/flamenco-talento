import React from "react";
import { Mail, Phone, CreditCard } from "lucide-react";
import { stegaClean } from "next-sanity";
import { Logo } from "@/components/site/Logo";
import type { SiteSettings } from "@/components/blocks/types";

// lucide-react v1.24 removed the Facebook/Instagram brand glyphs, so these are
// inline SVGs copied from an earlier lucide release, styled to match the other
// (stroke-based, size-driven) icons.
function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer({ settings }: { settings: SiteSettings | null }) {
  // Clean stega encoding off CMS hrefs so anchor targets match section ids
  // under visual editing, and href-based filtering works.
  const navLinks = (settings?.navLinks ?? []).map((link) => ({
    ...link,
    href: stegaClean(link.href),
  }));
  const quickLinks = navLinks.filter(
    (link) => !(link.href ?? "").toLowerCase().includes("kontakt"),
  );
  const phone = settings?.contactPhone;
  const email = settings?.contactEmail;
  const account = settings?.accountNumber;

  return (
    <footer className="bg-zinc-950 border-t border-white/10 pt-20 pb-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6 text-3xl">
              <Logo iconSize={36} />
            </div>
            {settings?.footerTagline && (
              <p className="text-flamenco-light/70 max-w-md mb-8 leading-relaxed">
                {settings.footerTagline}
              </p>
            )}
            <div className="flex gap-4">
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-flamenco-red transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={20} />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-flamenco-red transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-6">Kontakt Oss</h3>
            <ul className="space-y-4">
              {phone && (
                <li>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-3 text-flamenco-light/70 hover:text-flamenco-red transition-colors"
                  >
                    <Phone size={18} className="text-flamenco-red" />
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 text-flamenco-light/70 hover:text-flamenco-red transition-colors"
                  >
                    <Mail size={18} className="text-flamenco-red" />
                    {email}
                  </a>
                </li>
              )}
              {account && (
                <li className="flex items-start gap-3 text-flamenco-light/70 pt-2">
                  <CreditCard size={18} className="text-flamenco-red shrink-0 mt-1" />
                  <span>
                    Kontonr.
                    <br />
                    {account}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-6">Snarveier</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href ?? link.label}>
                  <a
                    href={link.href ?? "#"}
                    className="text-flamenco-light/70 hover:text-white hover:underline underline-offset-4 decoration-flamenco-red transition-all"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-flamenco-light/40">
          <p>
            &copy; {new Date().getFullYear()} {settings?.footerCopyrightName}. Med enerett.
          </p>
          <p>Designet med lidenskap.</p>
        </div>
      </div>
    </footer>
  );
}
