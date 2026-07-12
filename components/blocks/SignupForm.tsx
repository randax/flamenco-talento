"use client";

import React, { useState } from "react";
import { dict } from "@/lib/dictionary";
import type { Lang } from "@/lib/i18n";
import { trpc } from "@/lib/trpc/client";

const labelClass =
  "block text-xs font-medium tracking-widest uppercase text-flamenco-light/70 mb-2";
const fieldClass =
  "w-full bg-flamenco-dark border border-white/10 px-4 py-3 text-white placeholder-flamenco-light/30 focus:outline-none focus:border-flamenco-red transition-colors disabled:opacity-60";

type FormState = {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  website: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  interest: "",
  message: "",
  website: "",
};

export function SignupForm({
  lang,
  interestOptions,
  successMessage,
}: {
  lang: Lang;
  interestOptions: string[];
  successMessage?: string | null;
}) {
  const t = dict(lang);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const submit = trpc.signup.submit.useMutation();

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await submit.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        interest: form.interest,
        message: form.message || undefined,
        website: form.website,
        lang,
      });
      setSubmitted(true);
    } catch {
      // submit.error is surfaced below; nothing else to do here.
    }
  }

  if (submitted) {
    return (
      <div className="bg-zinc-950 border border-white/10 p-8 md:p-10 text-center">
        <p className="text-flamenco-light">{successMessage || t.formSuccess}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-950 border border-white/10 p-8 md:p-10 space-y-6"
    >
      {/* Honeypot: hidden from real users, bots tend to fill every field. */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => handleChange("website", e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="signup-name" className={labelClass}>
            {t.formName}
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={submit.isPending}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="signup-email" className={labelClass}>
            {t.formEmail}
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={submit.isPending}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="signup-phone" className={labelClass}>
            {t.formPhone}
          </label>
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={submit.isPending}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="signup-interest" className={labelClass}>
            {t.formInterest}
          </label>
          <select
            id="signup-interest"
            name="interest"
            required
            value={form.interest}
            onChange={(e) => handleChange("interest", e.target.value)}
            disabled={submit.isPending}
            className={fieldClass}
          >
            <option value="" disabled>
              {t.formInterest}
            </option>
            {interestOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
          maxLength={2000}
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          disabled={submit.isPending}
          className={fieldClass}
        />
      </div>

      {submit.isError && <p className="text-sm text-flamenco-red">{t.formError}</p>}

      <button
        type="submit"
        disabled={submit.isPending}
        className="w-full py-4 bg-flamenco-red text-white font-medium tracking-widest uppercase text-sm transition-all duration-300 hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submit.isPending ? t.formSending : t.formSubmit}
      </button>
    </form>
  );
}
