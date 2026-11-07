import { ArrowDown, CalendarClock, ChevronDown, Info, Minus, Plus, Equal } from "lucide-react";
import type { ReactNode } from "react";
import { Money } from "@/components/Money";
import { useLanguage, type StringKey } from "@/lib/i18n";
import { addDaysIso, fmtDate, pick } from "@/lib/l10n";
import type { OutlookData } from "@/lib/outlook-data";
import { cn } from "@/lib/utils";

const billKeys: Record<string, StringKey> = { Rent: "rent", Phone: "phone", "Money sent home": "moneyHome", "Car insurance (annual)": "outlookInsurance" };

/** "Why am I seeing this?": the plain-code sum behind the risk. Every figure comes from the forecast; no AI. */
export function RiskWhy({ data }: { data: OutlookData }) {
  const { t, lang } = useLanguage();
  const L = (en: string, ar: string) => pick(lang, en, ar);
  const risk = data.risks[0];
  if (!risk) return null;

  // Re-add the forecast walk from today to the lowest day, in bad weeks.
  const upto = data.days.filter(d => d.date <= risk.lowestDay);
  let payIn = 0, payCount = 0, billsOut = 0;
  for (const d of upto) for (const e of d.events) {
    if (e.amount > 0) { payIn += e.lowAmount ?? e.amount; payCount++; } else billsOut += -e.amount;
  }
  const everyday = data.dailySpend * upto.length;
  const from = addDaysIso(risk.week, -3);
  const shortWeekBills = data.days.filter(d => d.date >= from && d.date <= risk.firstDay)
    .flatMap(d => d.events.filter(e => e.amount < 0).map(e => ({ ...e, date: d.date })));

  const Step = ({ icon, label, note, amount, tone }: { icon: ReactNode; label: string; note: string; amount: number; tone: "base" | "in" | "out" | "result" }) => (
    <li className={cn("flex items-center gap-3 rounded-2xl p-3", tone === "result" ? "bg-destructive/10" : "bg-muted/60")}>
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", tone === "in" ? "bg-primary text-primary-foreground" : tone === "out" ? "bg-secondary text-secondary-foreground" : tone === "result" ? "bg-destructive text-white" : "bg-card text-primary")}>{icon}</span>
      <div className="min-w-0 flex-1"><p className="text-lg font-bold leading-tight">{label}</p><p className="text-sm text-muted-foreground">{note}</p></div>
      <p className={cn("text-end text-xl font-bold", tone === "result" && "text-destructive")}><Money amount={amount} /></p>
    </li>
  );

  return (
    <details className="group rounded-2xl border border-border bg-card shadow-sm open:shadow-md">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 text-lg font-bold text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <Info aria-hidden className="size-5 shrink-0" />
        <span className="flex-1">{L("Why am I seeing this?", "لماذا أرى هذا؟")}</span>
        <span className="hidden rounded-full bg-muted px-3 py-1 text-sm text-secondary sm:inline">{L("No AI · plain maths", "بلا ذكاء اصطناعي · حساب بسيط")}</span>
        <ChevronDown aria-hidden className="size-5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-6 border-t border-border px-4 pb-5 pt-4">
        <p className="text-base text-muted-foreground">{L(
          `We plan for your bad weeks, not your average ones. Using your last ${data.income.weeksOfHistory} weeks, here is how your balance gets to its lowest point on ${fmtDate(lang, risk.lowestDay, { day: "numeric", month: "long" })}.`,
          `نخطط لأسابيعك الصعبة، وليس للمتوسط. باستخدام آخر ${data.income.weeksOfHistory} أسبوعًا، هكذا يصل رصيدك إلى أدنى نقطة في ${fmtDate(lang, risk.lowestDay, { day: "numeric", month: "long" })}.`)}</p>

        <ol className="space-y-2" aria-label={L("How the balance is worked out", "كيف يُحسب الرصيد")}>
          <Step tone="base" icon={<CalendarClock aria-hidden className="size-5" />} label={L("Balance today", "الرصيد اليوم")} note={fmtDate(lang, data.today, { day: "numeric", month: "long" })} amount={data.currentBalance} />
          <Step tone="in" icon={<Plus aria-hidden className="size-5" />} label={L("Pay, if every week is a bad week", "الأجر، إذا كانت كل الأسابيع صعبة")} note={L(`${payCount} paydays × £${data.income.low} (your low week)`, `${payCount} دفعات × ${data.income.low} جنيه (أسبوعك الضعيف)`)} amount={payIn} />
          <Step tone="out" icon={<Minus aria-hidden className="size-5" />} label={L("Everyday spending", "المصاريف اليومية")} note={L(`£${Math.round(data.dailySpend * 7)} a week on food and transport`, `${Math.round(data.dailySpend * 7)} جنيهًا أسبوعيًا للطعام والمواصلات`)} amount={-everyday} />
          <Step tone="out" icon={<Minus aria-hidden className="size-5" />} label={L("Bills", "الفواتير")} note={L("Rent, phone, money home, car insurance", "الإيجار والهاتف والمال للأهل وتأمين السيارة")} amount={-billsOut} />
          <Step tone="result" icon={<Equal aria-hidden className="size-5" />} label={L("Lowest point", "أدنى نقطة")} note={fmtDate(lang, risk.lowestDay, { day: "numeric", month: "long" })} amount={risk.badCaseBalance} />
        </ol>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-4">
            <h4 className="text-base font-bold text-secondary">{L("What lands in the short week", "ما يُستحق في الأسبوع الصعب")}</h4>
            <ul className="mt-2 divide-y divide-border">
              {shortWeekBills.map((b, i) => <li key={i} className="flex items-baseline justify-between gap-3 py-2"><span className="text-base">{t(billKeys[b.name] ?? "catBills")} <span className="text-sm text-muted-foreground">· {fmtDate(lang, b.date)}</span></span><span className="font-bold"><Money amount={-b.amount} /></span></li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <h4 className="text-base font-bold text-secondary">{L("Your pay range", "نطاق أجرك")}</h4>
            <div className="mt-3 flex items-end justify-between gap-2 text-center">
              {[["Low", "ضعيف", data.income.low, true], ["Typical", "عادي", data.income.typical, false], ["Good", "جيد", data.income.high, false]].map(([en, ar, v, used]) =>
                <div key={String(en)} className={cn("flex-1 rounded-xl p-2", used ? "bg-primary/10 ring-2 ring-primary" : "bg-muted/60")}><p className="text-sm text-muted-foreground">{L(String(en), String(ar))}</p><p className="text-lg font-bold"><Money amount={Number(v)} /></p></div>)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{L("The forecast uses your low week, so a slow week can't catch you out.", "تستخدم التوقعات أسبوعك الضعيف، حتى لا يفاجئك أسبوع بطيء.")}</p>
          </div>
        </div>

        <div className="brand-hero rounded-2xl p-4 text-white">
          <p className="text-sm font-bold uppercase tracking-wider text-white/75">{L("So the fix is", "إذن الحل هو")}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-bold" dir="auto">
            <Money amount={risk.shortfall} /><span className="text-white/70">÷</span>{risk.weeksUntil} {L("weeks", "أسابيع")}<ArrowDown aria-hidden className="size-5 -rotate-90 rtl:rotate-90" /><Money amount={risk.saveWeekly} /> {L("a week", "أسبوعيًا")}
          </p>
        </div>
      </div>
    </details>
  );
}
