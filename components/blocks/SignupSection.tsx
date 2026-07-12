import React from "react";
import { dict } from "@/lib/dictionary";
import type { Lang } from "@/lib/i18n";
import type { SignupFormBlock } from "@/components/blocks/types";

// Task 7 renders the section shell only; the live, validated form arrives in
// Task 8 and replaces this disabled placeholder. Fields are laid out in the
// design language (zinc panel, white/10 borders, flamenco-red submit,
// uppercase tracking-widest labels).
export function SignupSection({ block, lang }: { block: SignupFormBlock; lang: Lang }) {
  const t = dict(lang);
  const labelClass =
    "block text-xs font-medium tracking-widest uppercase text-flamenco-light/70 mb-2";
  const fieldClass =
    "w-full bg-flamenco-dark border border-white/10 px-4 py-3 text-white placeholder-flamenco-light/30 focus:outline-none focus:border-flamenco-red transition-colors disabled:opacity-60";

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

          <form className="bg-zinc-950 border border-white/10 p-8 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="signup-name" className={labelClass}>
                  {t.formName}
                </label>
                <input id="signup-name" name="name" type="text" disabled className={fieldClass} />
              </div>
              <div>
                <label htmlFor="signup-email" className={labelClass}>
                  {t.formEmail}
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  disabled
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="signup-phone" className={labelClass}>
                  {t.formPhone}
                </label>
                <input id="signup-phone" name="phone" type="tel" disabled className={fieldClass} />
              </div>
              <div>
                <label htmlFor="signup-interest" className={labelClass}>
                  {t.formInterest}
                </label>
                <input
                  id="signup-interest"
                  name="interest"
                  type="text"
                  disabled
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="signup-message" className={labelClass}>
                {t.formMessage}
              </label>
              <textarea
                id="signup-message"
                name="message"
                rows={4}
                disabled
                className={fieldClass}
              />
            </div>
            <button
              type="submit"
              disabled
              className="w-full py-4 bg-flamenco-red text-white font-medium tracking-widest uppercase text-sm transition-all duration-300 hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t.formSubmit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
