import { Fragment, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Pause, Play, RefreshCw } from "lucide-react";
import placeholderAudio from "@/assets/future-message-placeholder.mp3";
import { Money } from "@/components/Money";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { loadProfile } from "@/lib/profile";
import { buildOutlook, type OutlookData } from "@/lib/outlook-data";
import { prepareFutureMessage, saveCoachRisk, saveRiskAction, type RiskAction } from "@/lib/future-message";
import { cachedFutureMessage, liveFutureScript } from "@/lib/cached-future-message";
import { pauseAudio, playAudio, speak, stopSpeaking, useSpeakState } from "@/lib/speak";

const AUDIO_ID = "future-message";
const T = { show: { en: "Show transcript", ar: "عرض النص" }, hide: { en: "Hide transcript", ar: "إخفاء النص" } };
export function FutureMessage() {
  const { t, lang } = useLanguage();
  const [data, setData] = useState<OutlookData | null>(null);
  const [message, setMessage] = useState<{ text: string; src: string | null } | null>(null);
  const [status, setStatus] = useState<"preparing" | "ready" | "fallback">("preparing");
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState({ setAside: false, insuranceReminder: false });
  const [error, setError] = useState<"futureAudioError" | "futureSaveError" | null>(null);
  const audio = useSpeakState();
  const risk = data?.risks[0];
  useEffect(() => { setData(buildOutlook(loadProfile())); }, []);
  useEffect(() => {
    if (!data || !risk) return;
    let disposed = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    setStatus("preparing"); setMessage(null); setError(null);
    setSaved({ setAside: false, insuranceReminder: false }); // Fresh buttons on every load, so a demo always starts clean.
    prepareFutureMessage(risk, lang, data.persona, controller.signal).then(result => {
      if (!controller.signal.aborted) { setMessage({ text: result.text, src: "data:audio/mpeg;base64," + result.audio }); setStatus("ready"); }
    }).catch(() => {
      if (disposed) return;
      const cached = cachedFutureMessage(lang, data.persona.name, risk);
      if (cached) { setMessage(cached); setStatus("ready"); return; }
      if (lang === "en" || lang === "ar") { setMessage({ text: liveFutureScript(lang, data.persona.name, risk), src: null }); setStatus("ready"); return; }
      setStatus("fallback");
    }).finally(() => window.clearTimeout(timeout));
    return () => { disposed = true; controller.abort(); window.clearTimeout(timeout); stopSpeaking(); };
  }, [data, risk, lang, attempt]);
  if (!data || !risk) return null;
  const playing = audio.id === AUDIO_ID && audio.status === "playing";
  const loading = status === "preparing" || audio.id === AUDIO_ID && audio.status === "loading";
  const date = new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${risk.week}T00:00:00Z`));
  const billNames = risk.bills.map(name => name === "Rent" ? t("rent") : name === "Car insurance (annual)" ? t("outlookInsurance") : name === "Phone" ? t("phone") : name === "Money sent home" ? t("moneyHome") : t("catBills")).join(` ${t("outlookAnd")} `);
  const reason = billNames ? t("futureReasonBills").replace("{bills}", billNames) : t("futureReasonLow");
  const fallbackParts = t("futureFallback").split(/(\{week\}|\{reason\}|\{shortfall\}|\{fix\})/);
  const action = (key: RiskAction) => { try { saveRiskAction(risk, key); setSaved(previous => ({ ...previous, [key]: true })); setError(null); } catch { setError("futureSaveError"); } };
  const play = async () => {
    if (playing) { pauseAudio(AUDIO_ID); return; }
    setError(null);
    try {
      if (message && !message.src) { await speak(message.text, lang, AUDIO_ID); return; }
      await playAudio(message?.src ?? placeholderAudio, AUDIO_ID);
    } catch { setError("futureAudioError"); }
  };
  return <section aria-labelledby="future-message-title" className="rounded-2xl border border-primary/30 bg-card p-4 shadow-sm sm:p-5">
    <h2 id="future-message-title" className="mb-3 text-xl font-bold text-secondary">{t("futureTitle")}</h2>
    <div className="flex items-center gap-3">
      <Button onClick={play} disabled={loading} aria-label={playing ? t("futurePause") : t("futurePlay")} className="size-14 shrink-0 rounded-full p-0 [&_svg]:size-6">{loading ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden /> : playing ? <Pause aria-hidden /> : <Play aria-hidden />}</Button>
      <div className="min-w-0 flex-1"><p className="text-lg font-bold text-secondary">{t("futureSender")}</p><progress aria-label={t("futureProgress")} value={audio.id === AUDIO_ID ? audio.progress ?? 0 : 0} max={1} className="future-audio-progress mt-2 h-2 w-full" /></div>
    </div>
    {status === "preparing" ? <p role="status" className="mt-4 text-lg">{t("futurePreparing")}</p> : <>
      {status === "fallback" && <div className="mt-4 space-y-2"><p role="status" className="text-lg text-muted-foreground">{t("futureError")}</p><Button variant="outline" onClick={() => setAttempt(value => value + 1)} className="min-h-12 text-lg"><RefreshCw aria-hidden />{t("retry")}</Button><p className="text-base text-muted-foreground">{t("futurePlaceholder")}</p></div>}
      <p dir="auto" className={cn("mt-4 text-lg leading-relaxed", message && !expanded && "line-clamp-3")}>{message ? message.text : fallbackParts.map((part, i) => <Fragment key={i}>{part === "{week}" ? date : part === "{reason}" ? reason : part === "{shortfall}" ? <Money amount={risk.shortfall} /> : part === "{fix}" ? <>{t("outlookSave")} <Money amount={risk.saveWeekly} /> {t("outlookWeeklyFor")} {risk.weeksUntil} {t("outlookWeeks")}</> : part}</Fragment>)}</p>
      {message && <button type="button" onClick={() => setExpanded(v => !v)} aria-expanded={expanded} className="mt-1 min-h-10 rounded-md text-base font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">{(expanded ? T.hide : T.show)[lang === "ar" ? "ar" : "en"]}</button>}
    </>}
    {error && <p role="alert" className="mt-3 text-lg text-destructive">{t(error)}</p>}
    <div className="mt-4 flex flex-col gap-2">
      <Button variant="outline" onClick={() => action("setAside")} disabled={saved.setAside} className="h-auto min-h-12 whitespace-normal px-3 py-2 text-lg">{saved.setAside ? t("futurePlanSaved") : <>{t("futureSetAside")} <Money amount={risk.saveWeekly} /> {t("futureGoodWeeks")}</>}</Button>
      {saved.setAside && <p role="status" className="text-base text-muted-foreground">{t("futurePlanNote")}</p>}
      {risk.bills.some(name => name.toLowerCase().includes("insurance")) && <><Button variant="outline" onClick={() => action("insuranceReminder")} disabled={saved.insuranceReminder} className="h-auto min-h-12 whitespace-normal px-3 py-2 text-lg">{t(saved.insuranceReminder ? "futureReminderSaved" : "futureInsurance")}</Button>{saved.insuranceReminder && <p role="status" className="text-base text-muted-foreground">{t("futureReminderNote")}</p>}</>}
      <Button asChild className="min-h-12 text-lg"><Link to="/coach" onClick={event => { try { saveCoachRisk(risk); } catch { event.preventDefault(); setError("futureSaveError"); } }}>{t("futureTalk")}</Link></Button>
    </div>
    <p className="mt-4 text-base text-muted-foreground">{t("futureDisclaimer")}</p>
  </section>;
}