"use client";

import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "@/components/site/Motion";
import { Logo } from "@/components/site/Logo";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { dict } from "@/lib/dictionary";
import type { Lang } from "@/lib/i18n";
import type { SiteSettings } from "@/components/blocks/types";

type NavLink = { label?: string | null; href?: string | null };

function isKontakt(link: NavLink) {
  return (link.href ?? "").toLowerCase().includes("kontakt");
}

export function Header({ settings, lang }: { settings: SiteSettings | null; lang: Lang }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = dict(lang);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = settings?.navLinks ?? [];
  const ctaLink = navLinks.find(isKontakt);
  const primaryLinks = navLinks.filter((link) => link !== ctaLink);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-flamenco-dark/95 backdrop-blur-md py-4 shadow-lg shadow-black/50 border-b border-white/5" : "bg-transparent py-6"}`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <a href="#hjem" className="text-2xl md:text-3xl hover:opacity-80 transition-opacity">
          <Logo iconSize={28} />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {primaryLinks.map((link) => (
            <a
              key={link.href ?? link.label}
              href={link.href ?? "#"}
              className="text-sm font-medium tracking-widest uppercase text-flamenco-light/80 hover:text-white hover:underline underline-offset-8 decoration-flamenco-red transition-all"
            >
              {link.label}
            </a>
          ))}
          {ctaLink && (
            <a
              href={ctaLink.href ?? "#kontakt"}
              className="px-6 py-2 border border-flamenco-red text-flamenco-red hover:bg-flamenco-red hover:text-white transition-colors text-sm font-medium tracking-widest uppercase"
            >
              {ctaLink.label}
            </a>
          )}
          <LanguageSwitcher lang={lang} />
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(true)}
          aria-label={t.openMenu}
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            className="fixed inset-0 z-50 bg-flamenco-dark flex flex-col"
          >
            <div className="flex justify-end p-6">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white p-2"
                aria-label={t.closeMenu}
              >
                <X size={32} />
              </button>
            </div>
            <nav className="flex flex-col items-center justify-center flex-1 gap-8">
              {primaryLinks.map((link) => (
                <a
                  key={link.href ?? link.label}
                  href={link.href ?? "#"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-serif tracking-widest uppercase text-white hover:text-flamenco-red transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {ctaLink && (
                <a
                  href={ctaLink.href ?? "#kontakt"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-4 px-8 py-3 bg-flamenco-red text-white text-lg font-medium tracking-widest uppercase"
                >
                  {ctaLink.label}
                </a>
              )}
              <div className="mt-4">
                <LanguageSwitcher lang={lang} />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
