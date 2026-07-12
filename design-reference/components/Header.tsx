import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from './Logo'
const navLinks = [
  {
    name: 'Hjem',
    href: '#hjem',
  },
  {
    name: 'Om oss',
    href: '#om',
  },
  {
    name: 'Pedagog',
    href: '#pedagog',
  },
  {
    name: 'Timeplan',
    href: '#timeplan',
  },
  {
    name: 'Pris',
    href: '#pris',
  },
  {
    name: 'Galleri',
    href: '#galleri',
  },
  {
    name: 'Nyheter',
    href: '#nyheter',
  },
]
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-flamenco-dark/95 backdrop-blur-md py-4 shadow-lg shadow-black/50 border-b border-white/5' : 'bg-transparent py-6'}`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <a
          href="#hjem"
          className="text-2xl md:text-3xl hover:opacity-80 transition-opacity"
        >
          <Logo iconSize={28} />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium tracking-widest uppercase text-flamenco-light/80 hover:text-white hover:underline underline-offset-8 decoration-flamenco-red transition-all"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#kontakt"
            className="px-6 py-2 border border-flamenco-red text-flamenco-red hover:bg-flamenco-red hover:text-white transition-colors text-sm font-medium tracking-widest uppercase"
          >
            Kontakt
          </a>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Åpne meny"
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
                aria-label="Lukk meny"
              >
                <X size={32} />
              </button>
            </div>
            <nav className="flex flex-col items-center justify-center flex-1 gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-serif tracking-widest uppercase text-white hover:text-flamenco-red transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#kontakt"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 px-8 py-3 bg-flamenco-red text-white text-lg font-medium tracking-widest uppercase"
              >
                Kontakt Oss
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
