"use client";

import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { stegaClean } from "next-sanity";
import { motion } from "@/components/site/Motion";
import { capitalize } from "@/lib/strings";
import type { TimeplanBlock, ClassItem } from "@/components/blocks/types";

const DAY_ORDER = [
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
] as const;

type DayGroup = { day: string; label: string; classes: ClassItem[] };

function groupByDay(classes: ClassItem[]): DayGroup[] {
  return DAY_ORDER.map((day) => ({
    day,
    label: capitalize(day),
    classes: classes.filter((cls) => stegaClean(cls.day) === day),
  })).filter((group) => group.classes.length > 0);
}

export function Timeplan({ block }: { block: TimeplanBlock }) {
  const schedule = groupByDay(block.classes ?? []);

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
            {block.heading} <span className="text-flamenco-red italic">{block.headingAccent}</span>
          </h2>
          <p className="mt-6 text-flamenco-light/70 max-w-2xl mx-auto">{block.intro}</p>
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
                {dayPlan.label}
              </h3>

              <div className="space-y-6">
                {dayPlan.classes.map((cls) => (
                  <div key={cls._id} className="group">
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
                      <span>
                        {cls.startTime} - {cls.endTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {block.locationNote && (
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
              <span>{block.locationNote}</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
