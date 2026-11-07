import { useState } from "react";
import { CheckCircle2, PiggyBank, ShieldCheck } from "lucide-react";
import { Money } from "@/components/Money";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { addDaysIso, fmtDate, pick } from "@/lib/l10n";
import type { OutlookData } from "@/lib/outlook-data";

const KEY = "futureyou.emergencyPot";
export const POT_TARGET = 500;

/** Emergency fund pot: keep the weekly saving going after the gap is covered, up to a £500 buffer. */
export function EmergencyPot({ data }: { data: OutlookData }) {
  const { lang } = useLanguage();
  const L = (en: string, ar: string) => pick(lang, en, ar);
  const [started, setStarted] = useState<string | null>(null);
  const risk = data.risks[0];
  const weekly = risk?.saveWeekly ?? 20;
  const gap = risk?.shortfall ?? 0;
  const weeksToGap = Math.ceil(gap / weekly);
  const weeksToTarget = Math.ceil(POT_TARGET / weekly);
  const gapDate = addDaysIso(data.today, weeksToGap * 7);
  const targetDate = addDaysIso(data.today, weeksToTarget * 7);
  const gapPct = Math.min(100, (gap / POT_TARGET) * 100);
  const start = () => { const today = data.today; try { window.localStorage.setItem(KEY, today); } catch { /* ignore */ } setStarted(today); };
  const L2 = (d: string) => fmtDate(lang, d, { day: "numeric", month: "short", year: "numeric" });
  return (
    <section aria-labelledby="pot-title" className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-6 py-4">
        <span className="flex size-11 items-center justify-center rounded-xl bg-card text-primary shadow-sm"><PiggyBank aria-hidden className="size-6" /></span>
        <div className="min-w-0 flex-1"><h2 id="pot-title" className="text-xl font-bold text-secondary">{L("Emergency fund pot", "صندوق الطوارئ")}</h2>
          <p className="text-base text-muted-foreground">{L("A buffer so the next surprise bill isn't a crisis.", "احتياطي حتى لا تصبح الفاتورة المفاجئة القادمة أزمة.")}</p></div>
        {started && <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">{L("Active", "مفعّل")}</span>}
      </div>
      <div className="space-y-5 p-6">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-base text-muted-foreground">{L("Saving", "الادخار")}</p><p className="text-3xl font-bold text-secondary"><Money amount={weekly} /><span className="text-lg font-normal text-muted-foreground"> / {L("week", "أسبوع")}</span></p></div>
          <div className="text-end"><p className="text-base text-muted-foreground">{L("Goal", "الهدف")}</p><p className="text-3xl font-bold text-primary"><Money amount={POT_TARGET} /></p></div>
        </div>
        <div>
          <div className="relative h-4 overflow-hidden rounded-full bg-muted" role="img" aria-label={L(`Milestones: £${gap} gap covered, then £${POT_TARGET}`, `المراحل: تغطية الفجوة ${gap} ثم ${POT_TARGET}`)}>
            <div className="absolute inset-y-0 start-0 bg-primary/20" style={{ width: "100%" }} />
            <div className="brand-hero absolute inset-y-0 start-0 rounded-full" style={{ width: `${gapPct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-sm font-bold text-muted-foreground"><span>{L("Gap", "الفجوة")} <Money amount={gap} /></span><span><Money amount={POT_TARGET} /></span></div>
        </div>
        <ol className="space-y-3">
          <li className="flex items-start gap-3"><ShieldCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
            <div><p className="text-lg font-bold">{L("Enough for the short weeks", "كافٍ للأسابيع الصعبة")} · <Money amount={gap} /></p><p className="text-base text-muted-foreground">{L(`After ${weeksToGap} weeks`, `بعد ${weeksToGap} أسابيع`)} · {L2(gapDate)}</p></div></li>
          <li className="flex items-start gap-3"><CheckCircle2 aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
            <div><p className="text-lg font-bold">{L("Emergency fund full", "صندوق الطوارئ مكتمل")} · <Money amount={POT_TARGET} /></p><p className="text-base text-muted-foreground">{L(`Keep going for ${weeksToTarget} weeks`, `استمر لمدة ${weeksToTarget} أسبوعًا`)} · {L2(targetDate)}</p></div></li>
        </ol>
        {started ? <p role="status" className="rounded-xl bg-muted p-3 text-base">{L(`Pot started ${L2(started)}. Move £${weekly} in a good week; skip a bad one, that's fine.`, `بدأ الصندوق في ${L2(started)}. حوّل ${weekly} جنيهًا في الأسبوع الجيد، ولا بأس بتخطي الأسبوع الصعب.`)}</p>
          : <Button onClick={start} className="min-h-12 w-full rounded-xl text-lg font-bold">{L(`Start my pot · £${weekly} a week`, `ابدأ صندوقي · ${weekly} جنيهًا أسبوعيًا`)}</Button>}
        <p className="text-sm text-muted-foreground">{L("Planning only. No money is moved without you. Not financial advice.", "للتخطيط فقط. لا يتم تحويل أي أموال بدونك. ليست نصيحة مالية.")}</p>
      </div>
    </section>
  );
}
