import type { Lang } from "@/i18n/translations";

/**
 * Pre-recorded Future You voice notes for the Adam demo (made by voice/make_cached_audio.py
 * with ElevenLabs, served from public/audio). Text must match what the MP3 says.
 */
const CACHED: Partial<Record<Lang, { text: string; src: string }>> = {
  en: { text: "This is an AI-generated message, not financial advice. Hi Adam, it's you, from the future. January into early February was hard. Rent and the yearly car insurance landed together. In the slow weeks, we were up to £143 short. Two things would have helped. Saving £16 a week, starting now, for nine weeks. Or paying the car insurance monthly instead. Citizens Advice can help for free. Open the app, and let's talk it through.", src: "/audio/adam_en_future_message.mp3" },
  ar: { text: "هذه رسالة من الذكاء الاصطناعي، وليست نصيحة مالية. مرحبًا آدم، أنا أنتَ، من المستقبل. كانت الفترة من يناير إلى أوائل فبراير صعبة. خرج الإيجار وتأمين السيارة السنوي معًا. وفي الأسابيع الهادئة، كان ينقصنا ما يصل إلى مئة وثلاثة وأربعين جنيهًا. شيئان كانا سيساعداننا: أن ندّخر ستة عشر جنيهًا كل أسبوع، من الآن ولمدة تسعة أسابيع. أو أن ندفع تأمين السيارة شهريًا بدلًا من دفعة واحدة. منظمة Citizens Advice تساعد مجانًا. افتح التطبيق، ولنتحدث معًا.", src: "/audio/adam_ar_future_message.mp3" },
};

export function cachedFutureMessage(language: Lang, personaName: string) {
  return personaName.trim().toLowerCase() === "adam" ? CACHED[language] ?? null : null;
}
