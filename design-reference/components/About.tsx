import React from 'react'
import { motion } from 'framer-motion'
export function About() {
  return (
    <section id="om" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              margin: '-100px',
            }}
            transition={{
              duration: 0.8,
            }}
            className="relative"
          >
            <div className="absolute -inset-4 border border-flamenco-red/30 translate-x-4 translate-y-4 -z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1504609774514-cbcebc7c68b7?q=80&w=2070&auto=format&fit=crop"
              alt="Flamenco shoes and dress detail"
              className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              margin: '-100px',
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
            }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-white">
              Om <span className="text-flamenco-red italic">Skolen</span>
            </h2>
            <p className="text-flamenco-light/80 text-lg mb-6 leading-relaxed">
              Flamenco Talento ble etablert i 2005 og har siden vært en sentral
              aktør i det norske flamencemiljøet. Vi tilbyr undervisning av høy
              kvalitet for alle nivåer, med fokus på både teknikk og uttrykk.
            </p>

            <div className="mt-12 p-8 md:p-10 border-l-4 border-flamenco-red bg-white/5 relative group hover:bg-white/10 transition-colors duration-500">
              <span className="text-8xl text-flamenco-red/20 font-serif absolute -top-2 left-4 leading-none select-none group-hover:text-flamenco-red/30 transition-colors duration-500">
                "
              </span>
              <p className="text-xl md:text-2xl font-serif italic text-white relative z-10 leading-relaxed">
                I flamencoen ligger følelsene utenpå det estetiske. Derfor
                avhenger forståelsen og utøvelsen av sensibiliteten.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
