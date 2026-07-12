import React from 'react'
import { Facebook, Instagram, Mail, Phone, CreditCard } from 'lucide-react'
import { Logo } from './Logo'
export function Footer() {
  return (
    <footer
      id="kontakt"
      className="bg-zinc-950 border-t border-white/10 pt-20 pb-10"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6 text-3xl">
              <Logo iconSize={36} />
            </div>
            <p className="text-flamenco-light/70 max-w-md mb-8 leading-relaxed">
              I flamencoen ligger følelsene utenpå det estetiske. Derfor
              avhenger forståelsen og utøvelsen av sensibiliteten.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-flamenco-red transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-flamenco-red transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-6">
              Kontakt Oss
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:41288996"
                  className="flex items-center gap-3 text-flamenco-light/70 hover:text-flamenco-red transition-colors"
                >
                  <Phone size={18} className="text-flamenco-red" />
                  Mob. 412 88 996
                </a>
              </li>
              <li>
                <a
                  href="mailto:danitza@flamenco-talento.no"
                  className="flex items-center gap-3 text-flamenco-light/70 hover:text-flamenco-red transition-colors"
                >
                  <Mail size={18} className="text-flamenco-red" />
                  danitza@flamenco-talento.no
                </a>
              </li>
              <li className="flex items-start gap-3 text-flamenco-light/70 pt-2">
                <CreditCard
                  size={18}
                  className="text-flamenco-red shrink-0 mt-1"
                />
                <span>
                  Kontonr.
                  <br />
                  6524 10 66627
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-6">
              Snarveier
            </h3>
            <ul className="space-y-3">
              {[
                'Hjem',
                'Om oss',
                'Pedagog',
                'Timeplan',
                'Pris',
                'Galleri',
                'Nyheter',
              ].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(' ', '')}`}
                    className="text-flamenco-light/70 hover:text-white hover:underline underline-offset-4 decoration-flamenco-red transition-all"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-flamenco-light/40">
          <p>
            &copy; {new Date().getFullYear()} Flamenco Talento. Med enerett.
          </p>
          <p>Designet med lidenskap.</p>
        </div>
      </div>
    </footer>
  )
}
