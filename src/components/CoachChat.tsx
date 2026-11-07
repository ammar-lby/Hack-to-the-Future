import { Fragment, useEffect, useRef, useState } from "react";
import { Loader2, Mic, Pause, Play, RefreshCw, Send, Square, TriangleAlert } from "lucide-react";
import { COACH_WEBHOOK_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/Money";
import { useLanguage } from "@/lib/i18n";
import { buildOutlook } from "@/lib/outlook-data";
import { loadProfile } from "@/lib/profile";
import type { ForecastRisk } from "@/lib/forecast";
import { getRecognitionConstructor, helpTextParts, recognitionLocales, requestCoach, type ChatMessage, type RecognitionInstance } from "@/lib/coach";
import { canRecord, startRecording, transcribe, type Recorder } from "@/lib/transcribe";
import { pauseAudio, playAudio, stopSpeaking, useSpeakState } from "@/lib/speak";
import { cn } from "@/lib/utils";

const AI_WARNING: Partial<Record<string, string>> & { en: string } = {
  en: "You are talking to an AI, not a person. It can make mistakes and is not regulated financial advice. It will never ask for your bank details. For free, expert help, contact Citizens Advice or StepChange. If you are struggling, call Samaritans on 116 123.",
  ar: "أنت تتحدث مع ذكاء اصطناعي، وليس مع شخص. قد يخطئ، وما يقدّمه ليس نصيحة مالية مرخّصة. لن يطلب منك أبدًا بيانات حسابك البنكي. للحصول على مساعدة مجانية من خبراء، تواصل مع Citizens Advice أو StepChange. إذا كنت تمر بوقت صعب، اتصل بـ Samaritans على الرقم ⁦116 123⁩.",
};

const SUGGESTIONS: Partial<Record<string, string[]>> = {
  en: ["Why will January be hard?", "Can I send £150 home this month?", "What if I pay my car insurance monthly?"],
  ar: ["لماذا سيكون شهر يناير صعبًا؟", "هل أستطيع إرسال ١٥٠ جنيهًا لأهلي هذا الشهر؟", "ماذا لو دفعت تأمين السيارة شهريًا؟"],
};

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
  const [transcribing, setTranscribing] = useState(false);
  const recorder = useRef<Recorder | null>(null);
  const recognition = useRef<RecognitionInstance | null>(null);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const pending = useRef<ChatMessage[] | null>(null);
  const end = useRef<HTMLDivElement | null>(null);
  const audio = useSpeakState();
  useEffect(() => {
    setSupported(canRecord() || Boolean(getRecognitionConstructor()));
    try {
      const value = JSON.parse(window.localStorage.getItem("futureyou.coachRisk") ?? "null");
      if (value && typeof value.week === "string" && typeof value.shortfall === "number" && typeof value.saveWeekly === "number" && typeof value.weeksUntil === "number") setRisk(value);
    } catch { /* No stored context. */ }
    return () => { recorder.current?.cancel(); recognition.current?.abort(); controller.current?.abort(); stopSpeaking(); };
  }, []);
  useEffect(() => {
    recorder.current?.cancel(); recorder.current = null; setTranscribing(false);
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
    if (!input.trim() || busy.current) return;
    const next = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(next); setInput(""); void send(next);
  }
  async function toggleRecording() {
    if (recorder.current) {
      const active = recorder.current; recorder.current = null; setListening(false); setTranscribing(true);
      const request = new AbortController(); const timeout = window.setTimeout(() => request.abort(), 30000);
      try {
        const text = await transcribe(await active.stop(), request.signal);
        setInput(previous => `${previous.trim()} ${text}`.trim().slice(0, 4000));
      } catch { setMicError(true); }
      finally { window.clearTimeout(timeout); setTranscribing(false); }
      return;
    }
    stopSpeaking(); setMicError(false);
    try { recorder.current = await startRecording(); setListening(true); } catch { setMicError(true); }
  }
  function toggleMic() {
    if (transcribing) return;
    if (canRecord()) { void toggleRecording(); return; }
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
    <div role="note" className="flex gap-3 rounded-2xl border border-accent bg-accent/25 p-4">
      <TriangleAlert aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
      <p dir="auto" className="text-base leading-relaxed">{AI_WARNING[lang] ?? AI_WARNING.en}</p>
    </div>
    {risk && <div className="border-s-4 border-primary ps-4"><h2 className="text-xl font-bold">{t("coachContext")}</h2><p className="mt-2 text-lg">{t("outlookWeekOf")} {date(risk.week)} · {t("outlookShortfall")} <Money amount={risk.shortfall} className="font-bold" /></p><p className="mt-2 text-lg">{t("outlookSave")} <Money amount={risk.saveWeekly} /> {t("outlookWeeklyFor")} {risk.weeksUntil} {t("outlookWeeks")}</p></div>}
    {!COACH_WEBHOOK_URL && <p role="status" className="text-lg text-muted-foreground">{t("coachUnavailable")}</p>}
    <div role="log" aria-label={t("coachChatLabel")} aria-relevant="additions text" className="min-h-36 space-y-4">
      {!messages.length && !sending && <div className="space-y-4"><p className="text-lg text-muted-foreground">{t("coachEmpty")}</p>
        {SUGGESTIONS[lang] && <div className="flex flex-wrap gap-2">{SUGGESTIONS[lang]!.map(q => <button key={q} type="button" dir="auto" onClick={() => { const next = [{ role: "user" as const, content: q }]; setMessages(next); void send(next); }} className="min-h-11 rounded-full border border-primary/30 bg-card px-4 text-base font-bold text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">{q}</button>)}</div>}
      </div>}
      {messages.map((message, i) => <article key={i} className={cn("min-w-0 max-w-[90%] rounded-2xl px-4 py-3", message.role === "user" ? "ms-auto bg-secondary text-secondary-foreground" : "me-auto border border-border bg-card text-card-foreground")}>
        <p className="mb-1 text-base font-bold">{t(message.role === "user" ? "coachYou" : "futureSender")}</p>
        <p dir="auto" className="whitespace-pre-wrap break-words text-lg leading-relaxed">{helpTextParts(message.content).map((part, j) => <Fragment key={j}>{part.url && message.role === "assistant" ? <a href={part.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 min-w-11 items-center rounded-sm font-bold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">{part.text}</a> : part.text}</Fragment>)}</p>
        {message.role === "assistant" && message.subtitle && lang !== "en" && <p dir="ltr" lang="en" className="mt-2 border-t border-border pt-2 text-base italic text-muted-foreground">{message.subtitle}</p>}
        {message.role === "assistant" && message.audio && <Button variant="outline" onClick={() => playReply(message, i)} className="mt-3 min-h-12 text-lg" disabled={audio.id === `coach-reply-${i}` && audio.status === "loading"}>{audio.id === `coach-reply-${i}` && audio.status === "playing" ? <Pause aria-hidden /> : <Play aria-hidden />}{t(audio.id === `coach-reply-${i}` && audio.status === "playing" ? "coachPause" : "coachPlay")}</Button>}
      </article>)}
      {sending && <div role="status" className="me-auto flex w-fit items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-lg"><Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />{t("coachSending")}</div>}
      {failed && <div role="alert" className="space-y-3 border-s-4 border-destructive ps-4"><p className="text-lg">{t(COACH_WEBHOOK_URL ? "coachError" : "coachUnavailable")}</p><Button variant="outline" onClick={() => { if (pending.current) void send(pending.current); }} className="min-h-12 text-lg"><RefreshCw aria-hidden />{t("retry")}</Button></div>}
      <div ref={end} />
    </div>
    <form onSubmit={submit} className="space-y-3 border-t border-border pt-4">
      <label htmlFor="coach-message" className="block text-lg font-bold">{t("coachQuestion")}</label>
      <textarea id="coach-message" value={input} onChange={event => { setInput(event.target.value); setFailed(false); }} maxLength={4000} rows={2} className="w-full rounded-lg border-2 border-input bg-card p-3 text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring" />
      <div className="flex gap-3">{supported && <Button type="button" variant={listening ? "destructive" : "outline"} onClick={toggleMic} aria-label={t(listening ? "coachMicStop" : "coachMic")} aria-pressed={listening} disabled={sending || transcribing} className="size-14 shrink-0 [&_svg]:size-6">{listening ? <Square aria-hidden /> : <Mic aria-hidden />}</Button>}<Button type="submit" disabled={!input.trim() || sending || listening} className="min-h-14 flex-1 text-lg"><Send aria-hidden className="rtl:rotate-180" />{t(sending ? "coachSending" : "coachSend")}</Button></div>
      {listening && <p role="status" className="text-lg text-primary">{t("coachListening")}</p>}
      {transcribing && <p role="status" className="text-lg text-primary">{t("coachSending")}</p>}
      {supported === false && <p className="text-base text-muted-foreground">{t("coachMicUnsupported")}</p>}
      {micError && <p role="alert" className="text-lg text-destructive">{t("coachMicError")}</p>}
      <p className="text-base text-muted-foreground">{t("coachDisclaimer")}</p>
    </form>
    {audioError && <p role="alert" className="text-lg text-destructive">{t("coachAudioError")}</p>}
  </section>;
}