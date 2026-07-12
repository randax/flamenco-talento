import type { Lang } from "@/lib/i18n";

export type Dictionary = {
  openMenu: string;
  closeMenu: string;
  readMore: string;
  backToNews: string;
  formName: string;
  formEmail: string;
  formPhone: string;
  formInterest: string;
  formMessage: string;
  formSubmit: string;
  formSending: string;
  formError: string;
  formSuccess: string;
  validationRequired: string;
  validationEmail: string;
};

const dictionaries: Record<Lang, Dictionary> = {
  no: {
    openMenu: "Åpne meny",
    closeMenu: "Lukk meny",
    readMore: "Les mer",
    backToNews: "Tilbake til nyheter",
    formName: "Navn",
    formEmail: "E-post",
    formPhone: "Telefon",
    formInterest: "Jeg er interessert i",
    formMessage: "Melding",
    formSubmit: "Send påmelding",
    formSending: "Sender…",
    formError: "Noe gikk galt. Prøv igjen, eller kontakt oss på e-post.",
    formSuccess: "Takk! Vi har mottatt påmeldingen din.",
    validationRequired: "Dette feltet er påkrevd.",
    validationEmail: "Skriv inn en gyldig e-postadresse.",
  },
  en: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    readMore: "Read more",
    backToNews: "Back to news",
    formName: "Name",
    formEmail: "Email",
    formPhone: "Phone",
    formInterest: "I'm interested in",
    formMessage: "Message",
    formSubmit: "Send registration",
    formSending: "Sending…",
    formError: "Something went wrong. Please try again, or contact us by email.",
    formSuccess: "Thank you! We've received your registration.",
    validationRequired: "This field is required.",
    validationEmail: "Please enter a valid email address.",
  },
};

export function dict(lang: Lang): Dictionary {
  return dictionaries[lang];
}
