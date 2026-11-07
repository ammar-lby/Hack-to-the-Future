import { ChevronDown, Info } from "lucide-react";
import { Money } from "@/components/Money";
import { useLanguage, type StringKey } from "@/lib/i18n";
import { addDaysIso, fmtDate, pick } from "@/lib/l10n";
import type { OutlookData } from "@/lib/outlook-data";

const billKeys: Record<string, StringKey> = { Rent: "rent", Phone: "phone", "Money sent home": "moneyHome", "Car insurance (annual)": "outlookInsurance" };

/** "Why am I seeing this?": the plain-code maths behind the risk. No AI involved. */
export function RiskWhy({ data }: { data: OutlookData }) {
  const { t, lang } = useLanguage();
  const risk = data.risks[0];
  if (!risk) return null;
  const from = addDaysIso(risk.week, -3);
  const bills = data.days.filter(d => d.date >= from && d.date <= risk.firstDay)
    .flatMap(d => d.events.filter(e => e.amount < 0 && e.name !== "Planned spend").map(e => ({ ...e, date: d.date })));
  const weeklySpend = Math.round(data.dailySpend * 7);
  const L = (en: string, ar: string) => pick(lang, en, ar);
  const Row = ({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) => (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <dt className="text-base text-muted-foreground">{label}{note && <span className="block text-sm">{note}</span>}</dt>
      <dd className="text-end text-lg font-bold">{children}</dd>
    </div>
  );
  return (
    <details className="group rounded-2xl border border-border bg-card shadow-sm open:shadow-md">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 text-lg font-bold text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <Info aria-hidden className="size-5 shrink-0" />
        <span className="flex-1">{L("Why am I seeing this?", "لماذا أرى هذا؟")}</span>
        <ChevronDown aria-hidden className="size-5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 px-4 pb-5">
        <p className="text-base text-muted-foreground">{L("This is worked out by plain code from your last " + data.income.weeksOfHistory + " weeks, not by AI. Here is the maths.", "تم حساب هذا بشيفرة بسيطة من آخر " + data.income.weeksOfHistory + " أسبوعًا، وليس بالذكاء الاصطناعي. إليك الحساب.")}</p>
        <div>
          <h4 className="mb-1 text-sm font-bold uppercase tracking-wide text-secondary">{L("1 · Your weekly pay", "١ · أجرك الأسبوعي")}</h4>
          <dl>
            <Row label={L("Low week", "أسبوع ضعيف")} note={L("used for “bad weeks”", "يُستخدم لـ«الأسابيع الصعبة»")}><Money amount={data.income.low} /></Row>
            <Row label={L("Typical week", "أسبوع عادي")}><Money amount={data.income.typical} /></Row>
            <Row label={L("Good week", "أسبوع جيد")}><Money amount={data.income.high} /></Row>
          </dl>
        </div>
        <div>
          <h4 className="mb-1 text-sm font-bold uppercase tracking-wide text-secondary">{L("2 · What goes out", "٢ · ما يخرج")}</h4>
          <dl>
            <Row label={L("Everyday spending", "المصاريف اليومية")} note={L("food, transport, average", "طعام ومواصلات، كمتوسط")}><Money amount={weeklySpend} /> <span className="text-base font-normal text-muted-foreground">/ {L("week", "أسبوع")}</span></Row>
            {bills.map((b, i) => <Row key={i} label={t(billKeys[b.name] ?? "catBills")} note={fmtDate(lang, b.date, { day: "numeric", month: "long" })}><Money amount={-b.amount} /></Row>)}
          </dl>
        </div>
        <div>
          <h4 className="mb-1 text-sm font-bold uppercase tracking-wide text-secondary">{L("3 · The result", "٣ · النتيجة")}</h4>
          <dl>
            <Row label={L("Lowest point in bad weeks", "أدنى رصيد في الأسابيع الصعبة")} note={fmtDate(lang, risk.lowestDay, { day: "numeric", month: "long" })}><span className="text-destructive"><Money amount={risk.badCaseBalance} /></span></Row>
            <Row label={L("Gap to close", "الفجوة")}><Money amount={risk.shortfall} /></Row>
            <Row label={L("Weeks until it starts", "الأسابيع حتى تبدأ")}>{risk.weeksUntil}</Row>
          </dl>
        </div>
        <p className="rounded-xl bg-muted p-3 text-lg font-bold" dir="auto">
          <Money amount={risk.shortfall} /> ÷ {risk.weeksUntil} {L("weeks", "أسابيع")} ≈ <Money amount={risk.saveWeekly} /> {L("a week", "في الأسبوع")}
        </p>
      </div>
    </details>
  );
}
