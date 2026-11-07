import { Fragment, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Pause, Play, RefreshCw } from "lucide-react";
import placeholderAudio from "@/assets/future-message-placeholder.mp3";
import { Money } from "@/components/Money";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { loadProfile } from "@/lib/profile";
import { buildOutlook, type OutlookData } from "@/lib/outlook-data";
import { hasRiskAction, prepareFutureMessage, saveCoachRisk, saveRiskAction, type RiskAction } from "@/lib/future-message";
import { pauseAudio, playAudio, stopSpeaking, useSpeakState } from "@/lib/speak";

const AUDIO_ID = "future-message";
export function FutureMessage() {
  const { t, lang } = useLanguage();
  const [data, setData] = useState<OutlookData | null>(null);
  const [message, setMessage] = useState<{ text: string; audio: string } | null>(null);
  const [status, setStatus] = useState<"preparing" | "ready" | "fallback">("preparing");
  const [attempt, setAttempt] = useState(0);
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
    try { setSaved({ setAside: hasRiskAction(risk, "setAside"), insuranceReminder: hasRiskAction(risk, "insuranceReminder") }); } catch { /* Storage may be blocked. */ }
    prepareFutureMessage(risk, lang, data.persona, controller.signal).then(result => {
      if (!controller.signal.aborted) { setMessage(result); setStatus("ready"); }
    }).catch(() => { if (!disposed) setStatus("fallback"); }).finally(() => window.clearTimeout(timeout));
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
    try { await playAudio(message ? "data:audio/mpeg;base64," + message.audio : placeholderAudio, AUDIO_ID); } catch { setError("futureAudioError"); }
  };
  return <section aria-labelledby="future-message-title" className="rounded-2xl border border-primary/30 bg-card p-4 shadow-sm sm:p-5">
    <h2 id="future-message-title" className="mb-3 text-xl font-bold text-secondary">{t("futureTitle")}</h2>
    <div className="flex items-center gap-3">
      <Button onClick={play} disabled={loading} aria-label={playing ? t("futurePause") : t("futurePlay")} className="size-14 shrink-0 rounded-full p-0 [&_svg]:size-6">{loading ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden /> : playing ? <Pause aria-hidden /> : <Play aria-hidden />}</Button>
      <div className="min-w-0 flex-1"><p className="text-lg font-bold text-secondary">{t("futureSender")}</p><progress aria-label={t("futureProgress")} value={audio.id === AUDIO_ID ? audio.progress ?? 0 : 0} max={1} className="future-audio-progress mt-2 h-2 w-full" /></div>
    </div>
    {status === "preparing" ? <p role="status" className="mt-4 text-lg">{t("futurePreparing")}</p> : <>
      {status === "fallback" && <div className="mt-4 space-y-2"><p role="status" className="text-lg text-muted-foreground">{t("futureError")}</p><Button variant="outline" onClick={() => setAttempt(value => value + 1)} className="min-h-12 text-lg"><RefreshCw aria-hidden />{t("retry")}</Button><p className="text-base text-muted-foreground">{t("futurePlaceholder")}</p></div>}
      <p className="mt-4 text-lg leading-relaxed">{message ? message.text : fallbackParts.map((part, i) => <Fragment key={i}>{part === "{week}" ? date : part === "{reason}" ? reason : part === "{shortfall}" ? <Money amount={risk.shortfall} /> : part === "{fix}" ? <>{t("outlookSave")} <Money amount={risk.saveWeekly} /> {t("outlookWeeklyFor")} {risk.weeksUntil} {t("outlookWeeks")}</> : part}</Fragment>)}</p>
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