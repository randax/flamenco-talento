import React from "react";
import type { Lang } from "@/lib/i18n";
import type { SignupFormBlock } from "@/components/blocks/types";
import { SignupForm } from "@/components/blocks/SignupForm";

export function SignupSection({
  block,
  lang,
  interestOptions,
}: {
  block: SignupFormBlock;
  lang: Lang;
  interestOptions: string[];
}) {
  return (
    <section id="kontakt" className="py-24 md:py-32 bg-zinc-900 border-y border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
              {block.heading}{" "}
              <span className="text-flamenco-red italic">{block.headingAccent}</span>
            </h2>
            {block.intro && (
              <p className="mt-6 text-flamenco-light/70 max-w-2xl mx-auto">{block.intro}</p>
            )}
          </div>

          <SignupForm
            lang={lang}
            interestOptions={interestOptions}
            successMessage={block.successMessage}
          />
        </div>
      </div>
    </section>
  );
}
