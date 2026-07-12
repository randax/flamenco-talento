import React from 'react'
import { motion } from 'framer-motion'
export function Pedagog() {
  return (
    <section
      id="pedagog"
      className="py-24 md:py-32 bg-zinc-900 border-y border-white/5"
    >
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
            Vår <span className="text-flamenco-red italic">Pedagog</span>
          </h2>
          <div className="w-24 h-1 bg-flamenco-red mx-auto mt-6"></div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
            }}
            className="w-full md:w-2/5"
          >
            <div className="aspect-[3/4] overflow-hidden relative">
              <div className="absolute inset-0 bg-flamenco-red mix-blend-multiply opacity-20 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1546427660-eb346c344ba5?q=80&w=1974&auto=format&fit=crop"
                alt="Danitza Madeleine Rogers Olea"
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
            className="w-full md:w-3/5"
          >
            <h3 className="text-3xl font-serif font-bold text-white mb-2">
              Danitza Madeleine Rogers Olea
            </h3>
            <p className="text-flamenco-red tracking-widest uppercase text-sm font-medium mb-8">
              Kunstnerisk Leder & Hovedpedagog
            </p>

            <div className="space-y-6 text-flamenco-light/80 text-lg leading-relaxed font-light">
              <p>
                Danitza har ledet Flamenco Talento siden oppstarten i 2005. Med
                en dyp lidenskap for den andalusiske kulturen, har hun dedikert
                sitt liv til å formidle flamencoens kraft og eleganse til norske
                elever.
              </p>
              <p>
                Hennes undervisning kjennetegnes av en unik evne til å kombinere
                streng teknisk trening med fokus på det personlige uttrykket.
                Hun har utdannet seg hos anerkjente mestere i Spania og bringer
                den autentiske flamencofølelsen direkte inn i dansestudioet.
              </p>
              <p>
                "For meg handler ikke flamenco bare om trinn, men om å finne sin
                egen stemme gjennom bevegelse og rytme," sier Danitza.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
