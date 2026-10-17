import en from "./en";
import fr from "./fr";
import rw from "./rw";

export const locales = ["en", "fr", "rw"] as const;
export type Locale = (typeof locales)[number];
export type Messages = typeof en;

export const defaultLocale: Locale = "en";
export const localeCookie = "NEXT_LOCALE";
export const messages = { en, fr, rw } satisfies Record<Locale, Messages>;
