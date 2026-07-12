"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "@/components/site/Motion";
import type { PrisBlock } from "@/components/blocks/types";

export function Pris({ block }: { block: PrisBlock }) {
  const plans = block.plans ?? [];

  return (
    <section id="pris" className="py-24 md:py-32 bg-zinc-900 border-y border-white/5">
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
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan._id}
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
              className={`relative p-8 flex flex-col ${plan.highlighted ? "bg-flamenco-red text-white shadow-2xl shadow-red-900/20 scale-105 z-10" : "bg-zinc-950 border border-white/10 text-flamenco-light"}`}
            >
              {plan.highlighted && plan.highlightLabel && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-flamenco-red text-xs font-bold tracking-widest uppercase px-4 py-1">
                  {plan.highlightLabel}
                </div>
              )}

              <h3 className="text-2xl font-serif font-bold mb-2">{plan.title}</h3>
              <div className="mb-6 pb-6 border-b border-current/20">
                <span className="text-4xl font-bold">kr {plan.price}</span>
                <span className="text-sm opacity-80 ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {(plan.features ?? []).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <Check size={18} className="shrink-0 mt-0.5" />
                    <span className="opacity-90">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#kontakt"
                className={`text-center py-3 font-medium tracking-widest uppercase text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${plan.highlighted ? "bg-white text-flamenco-red hover:bg-zinc-100 hover:shadow-white/20" : "bg-white/10 hover:bg-flamenco-red hover:text-white hover:shadow-red-900/50"}`}
              >
                {block.ctaLabelPrefix} {plan.title}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
