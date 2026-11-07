import type { Lang } from "@/i18n/translations";
import type { ForecastRisk } from "@/lib/forecast";

/**
 * Pre-recorded Future You voice notes for the Adam demo (made by voice/make_cached_audio.py
 * with ElevenLabs, served from public/audio). Text must match what the MP3 says.
 */
const CACHED: Partial<Record<Lang, { text: string; src: string }>> = {
  en: { text: "Hi Adam, it's you, from the future. January into early February was hard. Rent and the yearly car insurance landed together. In the slow weeks, we were up to £143 short. Two things would have helped. Saving £16 a week, starting now, for nine weeks. Or paying the car insurance monthly instead. Citizens Advice can help for free. Open the app, and let's talk it through.", src: "/audio/adam_en_future_message.mp3" },
  ar: { text: "مرحبًا آدم، أنا أنتَ، من المستقبل. كانت الفترة من يناير إلى أوائل فبراير صعبة. خرج الإيجار وتأمين السيارة السنوي معًا. وفي الأسابيع الهادئة، كان ينقصنا ما يصل إلى مئة وثلاثة وأربعين جنيهًا. شيئان كانا سيساعداننا: أن ندّخر ستة عشر جنيهًا كل أسبوع، من الآن ولمدة تسعة أسابيع. أو أن ندفع تأمين السيارة شهريًا بدلًا من دفعة واحدة. منظمة Citizens Advice تساعد مجانًا. افتح التطبيق، ولنتحدث معًا.", src: "/audio/adam_ar_future_message.mp3" },
};

// The numbers the cached recordings say out loud.
const RECORDED = { shortfall: 143, saveWeekly: 16, weeksUntil: 9 };

/** Cached recording, only when the live forecast still has exactly the numbers it says. */
export function cachedFutureMessage(language: Lang, personaName: string, risk: ForecastRisk) {
  const same = risk.shortfall === RECORDED.shortfall && risk.saveWeekly === RECORDED.saveWeekly && risk.weeksUntil === RECORDED.weeksUntil;
  return same && personaName.trim().toLowerCase() === "adam" ? CACHED[language] ?? null : null;
}

const MONTHS: Record<"en" | "ar", string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
};
const BILLS_AR: Record<string, string> = { Rent: "الإيجار", "Car insurance (annual)": "تأمين السيارة السنوي", Phone: "الهاتف", "Money sent home": "المال المرسل للأهل" };

/** Script built from the live forecast numbers, read aloud with the ElevenLabs voice. */
export function liveFutureScript(language: Lang, name: string, risk: ForecastRisk) {
  const lang = language === "ar" ? "ar" : "en";
  const m = (iso: string) => MONTHS[lang][new Date(`${iso}T00:00:00Z`).getUTCMonth()];
  const from = m(risk.firstDay), to = m(risk.lowestDay);
  if (lang === "ar") {
    const period = from === to ? `شهر ${from}` : `الفترة من ${from} إلى ${to}`;
    const bills = risk.bills.map(b => BILLS_AR[b] ?? b).join(" و");
    name = name.trim().toLowerCase() === "adam" ? "آدم" : name;
    return `مرحبًا ${name}، أنا أنتَ، من المستقبل. كانت ${period} صعبة.${bills ? ` جاء ${bills} معًا.` : ""} في الأسابيع الهادئة، كان ينقصنا ما يصل إلى ${risk.shortfall} جنيهًا. لو ادّخرنا ${risk.saveWeekly} جنيهًا كل أسبوع، من الآن ولمدة ${risk.weeksUntil} أسابيع، لكان ذلك كافيًا. منظمة Citizens Advice تساعد مجانًا.`;
  }
  const period = from === to ? from : `${from} into ${to}`;
  const bills = risk.bills.map(b => b === "Car insurance (annual)" ? "the yearly car insurance" : b.toLowerCase()).join(" and ");
  return `Hi ${name}, it's you, from the future. ${period} was hard.${bills ? ` ${bills.charAt(0).toUpperCase()}${bills.slice(1)} landed together.` : ""} In the slow weeks, we were up to £${risk.shortfall} short. Saving £${risk.saveWeekly} a week, starting now, for ${risk.weeksUntil} weeks, would cover it. Citizens Advice can help for free.`;
}
