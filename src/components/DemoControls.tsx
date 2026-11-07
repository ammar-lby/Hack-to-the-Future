import { useEffect, useState } from "react";
import { CalendarPlus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/Money";
import { useLanguage } from "@/lib/i18n";
import { loadProfile } from "@/lib/profile";
import { demoDate, loadDemoState, resetDemo, simulateNextWeek, useDemoRevision } from "@/lib/simulate";

export function DemoControls() {
  const { t, lang } = useLanguage();
  const revision = useDemoRevision();
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => { setIsDemo(loadProfile()?.source === "adam"); }, []);
  if (!isDemo) return null;
  const state = loadDemoState();
  const run = (reset: boolean) => {
    try { if (reset) resetDemo(); else { const saved = loadProfile(); if (saved?.source === "adam") simulateNextWeek(saved.data); } setError(false); } catch { setError(true); }
  };
  return <section aria-label={t("demoControl")} className="space-y-3 border-y border-border py-4" data-revision={revision}>
    <p className="text-base font-bold text-muted-foreground">{t("demoControl")} · {new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${demoDate(state)}T00:00:00Z`))}</p>
    <div className="flex flex-wrap gap-3"><Button onClick={() => run(false)} className="min-h-14 text-lg"><CalendarPlus aria-hidden />{t("simulateNextWeek")}</Button><Button variant="outline" onClick={() => run(true)} className="min-h-14 text-lg"><RotateCcw aria-hidden />{t("resetDemo")}</Button></div>
    {state.weeks > 0 && <p className="text-lg">{t("demoRentChange")} <Money amount={state.rentIncrease} /> · {t("demoProjectedTotals")}</p>}
    {error && <p role="alert" className="text-lg text-destructive">{t("futureSaveError")}</p>}
  </section>;
}