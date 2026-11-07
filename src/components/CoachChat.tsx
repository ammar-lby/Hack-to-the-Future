import { Fragment, useEffect, useRef, useState } from "react";
import { Loader2, Mic, Pause, Play, RefreshCw, Send, Square } from "lucide-react";
import { COACH_WEBHOOK_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/Money";
import { useLanguage } from "@/lib/i18n";
import { buildOutlook } from "@/lib/outlook-data";
import { loadProfile } from "@/lib/profile";
import type { ForecastRisk } from "@/lib/forecast";
import { getRecognitionConstructor, helpTextParts, recognitionLocales, requestCoach, type ChatMessage, type RecognitionInstance } from "@/lib/coach";
import { pauseAudio, playAudio, stopSpeaking, useSpeakState } from "@/lib/speak";
import { cn } from "@/lib/utils";

export function CoachChat() {
  const { t, lang } = useLanguage();
  const [risk, setRisk] = useState<ForecastRisk | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const recognition = useRef<RecognitionInstance | null>(null);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const pending = useRef<ChatMessage[] | null>(null);
  const end = useRef<HTMLDivElement | null>(null);
  const audio = useSpeakState();
  useEffect(() => {
    setSupported(Boolean(getRecognitionConstructor()));
    try {
      const value = JSON.parse(window.localStorage.getItem("futureyou.coachRisk") ?? "null");
      if (value && typeof value.week === "string" && typeof value.shortfall === "number" && typeof value.saveWeekly === "number" && typeof value.weeksUntil === "number") setRisk(value);
    } catch { /* No stored context. */ }
    return () => { recognition.current?.abort(); controller.current?.abort(); stopSpeaking(); };
  }, []);
  useEffect(() => {
    recognition.current?.abort(); setListening(false); controller.current?.abort(); busy.current = false;
    setSending(false); setMessages([]); setFailed(false); pending.current = null; setInput(""); stopSpeaking();
  }, [lang]);
  useEffect(() => { if (messages.length || sending) end.current?.scrollIntoView({ block: "nearest" }); }, [messages, sending]);

  const date = (iso: string) => new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  function contextMessage(): ChatMessage[] {
    if (!risk) return [];
    const content = t("coachRiskPrompt").replace("{week}", date(risk.week)).replace("{amount}", `${risk.shortfall} ${t("poundsWord")}`).replace("{weekly}", `${risk.saveWeekly} ${t("poundsWord")}`).replace("{weeks}", String(risk.weeksUntil));
    return [{ role: "user", content }];
  }
  async function send(next: ChatMessage[]) {
    if (busy.current) return;
    recognition.current?.abort(); setListening(false); busy.current = true;
    const request = new AbortController(); controller.current = request;
    const timeout = window.setTimeout(() => request.abort(), 20000);
    setSending(true); setFailed(false); pending.current = next;
    try {
      const result = await requestCoach([...contextMessage(), ...next], lang, buildOutlook(loadProfile()), request.signal);
      if (controller.current === request && !request.signal.aborted) { setMessages([...next, result]); pending.current = null; }
    } catch { if (controller.current === request) setFailed(true); }
    finally { window.clearTimeout(timeout); if (controller.current === request) { setSending(false); busy.current = false; } }
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || busy.current || failed) return;
    const next = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(next); setInput(""); void send(next);
  }
  function toggleMic() {
    if (listening) { recognition.current?.stop(); return; }
    const Constructor = getRecognitionConstructor();
    if (!Constructor) return;
    stopSpeaking(); setMicError(false);
    const instance = new Constructor(); recognition.current = instance;
    instance.lang = recognitionLocales[lang]; instance.continuous = false; instance.interimResults = false;
    instance.onresult = event => {
      const text = Array.from(event.results).map(result => result[0]?.transcript ?? "").join(" ").trim();
      if (text) setInput(previous => `${previous.trim()} ${text}`.trim().slice(0, 4000));
    };
    instance.onerror = event => { if (event.error !== "aborted") setMicError(true); setListening(false); };
    instance.onend = () => setListening(false);
    try { instance.start(); setListening(true); } catch { setMicError(true); }
  }
  async function playReply(message: ChatMessage, index: number) {
    const id = `coach-reply-${index}`;
    if (audio.id === id && audio.status === "playing") { pauseAudio(id); return; }
    if (!message.audio) return;
    setAudioError(false);
    try { await playAudio("data:audio/mpeg;base64," + message.audio, id); } catch { setAudioError(true); }
  }
  return <section className="space-y-5">
    <h1 className="text-3xl font-bold text-secondary">{t("coachTitle")}</h1>
    {risk && <div className="border-s-4 border-primary ps-4"><h2 className="text-xl font-bold">{t("coachContext")}</h2><p className="mt-2 text-lg">{t("outlookWeekOf")} {date(risk.week)} · {t("outlookShortfall")} <Money amount={risk.shortfall} className="font-bold" /></p><p className="mt-2 text-lg">{t("outlookSave")} <Money amount={risk.saveWeekly} /> {t("outlookWeeklyFor")} {risk.weeksUntil} {t("outlookWeeks")}</p></div>}
    {!COACH_WEBHOOK_URL && <p role="status" className="text-lg text-muted-foreground">{t("coachUnavailable")}</p>}
    <div role="log" aria-label={t("coachChatLabel")} aria-live="polite" className="min-h-36 space-y-4">
      {messages.map((message, i) => <article key={i} className={cn("max-w-[90%] rounded-2xl px-4 py-3", message.role === "user" ? "ms-auto bg-secondary text-secondary-foreground" : "me-auto border border-border bg-card text-card-foreground")}>
        <p className="mb-1 text-base font-bold">{t(message.role === "user" ? "coachYou" : "futureSender")}</p>
        <p className="whitespace-pre-wrap break-words text-lg leading-relaxed">{helpTextParts(message.content).map((part, j) => <Fragment key={j}>{part.url && message.role === "assistant" ? <a href={part.url} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-4">{part.text}</a> : part.text}</Fragment>)}</p>
        {message.role === "assistant" && message.audio && <Button variant="outline" onClick={() => playReply(message, i)} className="mt-3 min-h-12 text-lg" disabled={audio.id === `coach-reply-${i}` && audio.status === "loading"}>{audio.id === `coach-reply-${i}` && audio.status === "playing" ? <Pause aria-hidden /> : <Play aria-hidden />}{t(audio.id === `coach-reply-${i}` && audio.status === "playing" ? "coachPause" : "coachPlay")}</Button>}
      </article>)}
      {sending && <div role="status" className="me-auto flex w-fit items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-lg"><Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />{t("coachSending")}</div>}
      {failed && <div role="alert" className="space-y-3 border-s-4 border-destructive ps-4"><p className="text-lg">{t(COACH_WEBHOOK_URL ? "coachError" : "coachUnavailable")}</p><Button variant="outline" onClick={() => { if (pending.current) void send(pending.current); }} className="min-h-12 text-lg"><RefreshCw aria-hidden />{t("retry")}</Button></div>}
      <div ref={end} />
    </div>
    <form onSubmit={submit} className="space-y-3 border-t border-border pt-4">
      <label htmlFor="coach-message" className="block text-lg font-bold">{t("coachQuestion")}</label>
      <textarea id="coach-message" value={input} onChange={event => setInput(event.target.value)} maxLength={4000} rows={2} className="w-full rounded-lg border-2 border-input bg-card p-3 text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring" />
      <div className="flex gap-3">{supported && <Button type="button" variant={listening ? "destructive" : "outline"} onClick={toggleMic} aria-label={t(listening ? "coachMicStop" : "coachMic")} aria-pressed={listening} disabled={sending || failed} className="size-14 shrink-0 [&_svg]:size-6">{listening ? <Square aria-hidden /> : <Mic aria-hidden />}</Button>}<Button type="submit" disabled={!input.trim() || sending || failed || listening} className="min-h-14 flex-1 text-lg"><Send aria-hidden />{t(sending ? "coachSending" : "coachSend")}</Button></div>
      {listening && <p role="status" className="text-lg text-primary">{t("coachListening")}</p>}
      {supported === false && <p className="text-base text-muted-foreground">{t("coachMicUnsupported")}</p>}
      {micError && <p role="alert" className="text-lg text-destructive">{t("coachMicError")}</p>}
      <p className="text-base text-muted-foreground">{t("coachDisclaimer")}</p>
    </form>
    {audioError && <p role="alert" className="text-lg text-destructive">{t("coachAudioError")}</p>}
  </section>;
}