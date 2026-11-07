import { useSyncExternalStore } from "react";
import { TTS_WEBHOOK_URL } from "@/config";
import type { Lang } from "@/i18n/translations";

export type SpeakState = { id: string | null; status: "idle" | "loading" | "playing" };
let state: SpeakState = { id: null, status: "idle" };
const listeners = new Set<() => void>();
const set = (s: SpeakState) => { state = s; listeners.forEach((l) => l()); };
let audio: HTMLAudioElement | null = null;
let token = 0;

const voiceLang: Record<Lang, string> = { en: "en-GB", ar: "ar", hi: "hi-IN", bn: "bn-BD", ur: "ur-PK" };

/** Stop whatever is playing or loading. */
export function stopSpeaking() {
  token++;
  if (audio) { audio.pause(); audio.src = ""; audio = null; }
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  set({ id: null, status: "idle" });
}

function browserSpeak(text: string, language: Lang, my: number) {
  if (!("speechSynthesis" in window)) { set({ id: null, status: "idle" }); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voiceLang[language];
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith(voiceLang[language].slice(0, 2)));
  if (v) u.voice = v;
  u.onend = u.onerror = () => { if (my === token) set({ id: null, status: "idle" }); };
  window.speechSynthesis.speak(u);
}

/**
 * Read text aloud. Call only from a user click. Only one audio plays at a time.
 * Uses the n8n webhook when set, otherwise (or on failure) the browser's voice.
 */
export async function speak(text: string, language: Lang, id = "default") {
  stopSpeaking();
  const my = token;
  set({ id, status: "loading" });
  if (TTS_WEBHOOK_URL) {
    try {
      const res = await fetch(TTS_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, language }) });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const response = await res.json();
      if (!response?.audio) throw new Error("No audio");
      if (my !== token) return;
      audio = new Audio("data:audio/mpeg;base64," + response.audio);
      audio.onended = () => { if (my === token) set({ id: null, status: "idle" }); };
      await audio.play();
      set({ id, status: "playing" });
      return;
    } catch (e) {
      console.warn("Speech webhook failed, using browser voice", e);
      if (my !== token) return;
    }
  }
  set({ id, status: "playing" });
  browserSpeak(text, language, my);
}

export function useSpeakState() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state, () => state);
}
