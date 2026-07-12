import React from 'react'
import { motion } from 'framer-motion'
const images = [
  {
    src: 'https://images.unsplash.com/photo-1533614767277-ea7d48fb47c0?q=80&w=1000&auto=format&fit=crop',
    alt: 'Flamenco dancer with fan',
    className: 'col-span-1 md:col-span-2 row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1511222449225-188806202952?q=80&w=800&auto=format&fit=crop',
    alt: 'Spanish guitar detail',
    className: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1504609774514-cbcebc7c68b7?q=80&w=800&auto=format&fit=crop',
    alt: 'Flamenco shoes and dress',
    className: 'col-span-1 row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1546427660-eb346c344ba5?q=80&w=1000&auto=format&fit=crop',
    alt: 'Flamenco portrait',
    className: 'col-span-1 md:col-span-2 row-span-1',
  },
]
export function Gallery() {
  return (
    <section id="galleri" className="py-24 md:py-32 relative bg-zinc-950">
      {/* Abstract background art */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-flamenco-red/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-72 h-72 bg-flamenco-red/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
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
            Flamenco <span className="text-flamenco-red italic">Kunst</span>
          </h2>
          <p className="mt-6 text-flamenco-light/70 max-w-2xl mx-auto">
            Et visuelt innblikk i flamencoens lidenskap, detaljer og estetikk.
          </p>
          <div className="w-24 h-1 bg-flamenco-red mx-auto mt-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px] max-w-6xl mx-auto">
          {images.map((img, index) => (
            <motion.div
              key={index}
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
                delay: index * 0.1,
                duration: 0.5,
              }}
              className={`relative overflow-hidden group ${img.className}`}
            >
              <div className="absolute inset-0 bg-flamenco-red/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
