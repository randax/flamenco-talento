import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
const news = [
  {
    date: '19. August',
    title: 'Flamenco Talento starter opp igjen',
    excerpt:
      'Hjertelig velkommen til et nytt og spennende semester! Vi gleder oss til å se både gamle og nye fjes i studio. Tirsdag 19. august braker det løs.',
    featured: true,
  },
  {
    date: '12. September',
    title: 'Workshop med gjestepedagog',
    excerpt:
      'Vi får besøk direkte fra Sevilla for en intensiv helgeworkshop med fokus på bulerías.',
    featured: false,
  },
  {
    date: '05. Oktober',
    title: 'Høstforestilling planlegges',
    excerpt:
      'Sett av datoen for årets store elevforestilling. Mer informasjon om billetter kommer snart.',
    featured: false,
  },
]
export function Nyheter() {
  return (
    <section id="nyheter" className="py-24 md:py-32 relative">
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
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
              Siste <span className="text-flamenco-red italic">Nytt</span>
            </h2>
          </div>
          <a
            href="#nyheter"
            className="text-flamenco-red hover:text-white transition-colors flex items-center gap-2 text-sm font-medium tracking-widest uppercase"
          >
            Se alle nyheter <ChevronRight size={16} />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured News */}
          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            className="bg-flamenco-red p-8 md:p-12 flex flex-col justify-center relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-black/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            <div className="relative z-10">
              <span className="text-white/80 font-medium tracking-widest uppercase text-sm mb-4 block">
                {news[0].date}
              </span>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 leading-tight">
                {news[0].title}
              </h3>
              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                {news[0].excerpt}
              </p>
              <span className="inline-flex items-center gap-2 text-white font-medium tracking-widest uppercase text-sm group-hover:gap-4 transition-all">
                Les mer <ChevronRight size={16} />
              </span>
            </div>
          </motion.div>

          {/* Other News */}
          <div className="flex flex-col gap-8">
            {news.slice(1).map((item, index) => (
              <motion.div
                key={index}
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
                  delay: index * 0.1,
                }}
                className="bg-zinc-900/50 border border-white/5 p-8 hover:border-flamenco-red/30 transition-colors group cursor-pointer flex flex-col justify-center h-full"
              >
                <span className="text-flamenco-red font-medium tracking-widest uppercase text-xs mb-3 block">
                  {item.date}
                </span>
                <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-flamenco-red transition-colors">
                  {item.title}
                </h3>
                <p className="text-flamenco-light/70 text-sm leading-relaxed">
                  {item.excerpt}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
