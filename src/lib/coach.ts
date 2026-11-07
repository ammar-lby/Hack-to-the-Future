import { COACH_WEBHOOK_URL } from "@/config";
import type { Lang } from "@/i18n/translations";
import type { OutlookData } from "@/lib/outlook-data";

export type ChatMessage = { role: "user" | "assistant"; content: string; audio?: string; subtitle?: string };
export const recognitionLocales: Record<Lang, string> = { en: "en-GB", ar: "ar-SA", hi: "hi-IN", bn: "bn-BD", ur: "ur-PK" };
export function coachPayload(messages: ChatMessage[], language: Lang, forecast: OutlookData) {
  return { messages: messages.map(({ role, content }) => ({ role, content })), language, forecast };
}
export async function requestCoach(messages: ChatMessage[], language: Lang, forecast: OutlookData, signal: AbortSignal) {
  if (!COACH_WEBHOOK_URL) throw new Error("Coach not configured");
  const response = await fetch(COACH_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(coachPayload(messages, language, forecast)), signal });
  if (!response.ok) throw new Error(`Coach ${response.status}`);
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("text" in result) || typeof result.text !== "string" || !result.text.trim()) throw new Error("Missing reply");
  const audio = "audio" in result && typeof result.audio === "string" ? result.audio : "";
  const english = "text_en" in result && typeof result.text_en === "string" ? result.text_en.trim() : "";
  return { role: "assistant" as const, content: result.text, audio, subtitle: english && english !== result.text.trim() ? english : "" };
}

export function helpTextParts(text: string) {
  return text.split(/(StepChange|Citizens Advice|MoneyHelper)/gi).map(part => ({ text: part, url: part.toLowerCase() === "stepchange" ? "https://www.stepchange.org/" : part.toLowerCase() === "moneyhelper" ? "https://www.moneyhelper.org.uk/" : part.toLowerCase() === "citizens advice" ? "https://www.citizensadvice.org.uk/" : null }));
}

export type RecognitionInstance = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
export type RecognitionConstructor = new () => RecognitionInstance;
export function getRecognitionConstructor(): RecognitionConstructor | null {
  const browser = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition ?? null;
}