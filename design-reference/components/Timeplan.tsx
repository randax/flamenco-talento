import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin } from 'lucide-react'
const schedule = [
  {
    day: 'Mandag',
    classes: [
      {
        name: 'Nybegynner',
        time: '17:30 - 18:45',
        level: 'Nivå 1',
      },
      {
        name: 'Teknikk & Koreografi',
        time: '19:00 - 20:30',
        level: 'Litt øvet',
      },
    ],
  },
  {
    day: 'Tirsdag',
    classes: [
      {
        name: 'Viderekommende',
        time: '18:00 - 19:30',
        level: 'Nivå 3',
      },
      {
        name: 'Bata de Cola',
        time: '19:30 - 21:00',
        level: 'Åpent nivå',
      },
    ],
  },
  {
    day: 'Torsdag',
    classes: [
      {
        name: 'Flamenco Fitness',
        time: '17:00 - 18:00',
        level: 'Alle',
      },
      {
        name: 'Kompani Trening',
        time: '18:15 - 20:15',
        level: 'Avansert',
      },
    ],
  },
]
export function Timeplan() {
  return (
    <section id="timeplan" className="py-24 md:py-32 relative">
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
            Høstens <span className="text-flamenco-red italic">Timeplan</span>
          </h2>
          <p className="mt-6 text-flamenco-light/70 max-w-2xl mx-auto">
            Finn klassen som passer for deg. Vi tilbyr undervisning for alle
            nivåer, fra helt nybegynner til avansert.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {schedule.map((dayPlan, index) => (
            <motion.div
              key={dayPlan.day}
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
              transition={{
                delay: index * 0.1,
              }}
              className="bg-zinc-900/50 border border-white/10 p-8 transition-all duration-300 hover:border-flamenco-red/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
            >
              <h3 className="text-2xl font-serif font-bold text-white mb-6 pb-4 border-b border-white/10 flex items-center gap-3">
                <Calendar className="text-flamenco-red" size={24} />
                {dayPlan.day}
              </h3>

              <div className="space-y-6">
                {dayPlan.classes.map((cls, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-white group-hover:text-flamenco-red transition-colors">
                        {cls.name}
                      </h4>
                      <span className="text-xs font-bold tracking-wider uppercase bg-white/10 px-2 py-1 text-flamenco-light">
                        {cls.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-flamenco-light/60">
                      <Clock size={14} />
                      <span>{cls.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          className="mt-16 text-center flex flex-col items-center justify-center gap-4 text-flamenco-light/80"
        >
          <div className="flex items-center gap-2">
            <MapPin className="text-flamenco-red" size={20} />
            <span>Alle klasser holdes i våre lokaler i Oslo sentrum.</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
