import type { Lang } from "@/i18n/translations";

/** Inline copy for new UI: Arabic when the app is in Arabic, English otherwise. */
export const pick = (lang: Lang, en: string, ar: string) => (lang === "ar" ? ar : en);
export const fmtDate = (lang: Lang, iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", { ...opts, timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
export const addDaysIso = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/** Show the demo persona's name in the user's script. */
export const displayName = (lang: Lang, name: string) => (lang === "ar" && name.trim().toLowerCase() === "adam" ? "آدم" : name);
