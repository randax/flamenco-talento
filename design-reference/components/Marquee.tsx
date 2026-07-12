import React, { Fragment } from 'react'
import { motion } from 'framer-motion'
const words = [
  'PASIÓN',
  'DUENDE',
  'COMPÁS',
  'TACONEO',
  'ARTE',
  'FLAMENCO',
  'ALMA',
  'FUERZA',
]
export function Marquee() {
  return (
    <div className="w-full overflow-hidden bg-flamenco-red py-6 border-y border-red-900/50">
      <div className="relative flex whitespace-nowrap">
        <motion.div
          className="flex items-center gap-12 px-6"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 20,
          }}
        >
          {/* Double the words array to create a seamless loop */}
          {[...words, ...words].map((word, index) => (
            <Fragment key={index}>
              <span className="text-2xl md:text-4xl font-serif font-bold text-white/90 tracking-widest">
                {word}
              </span>
              <span className="text-white/30 text-xl">✦</span>
            </Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
