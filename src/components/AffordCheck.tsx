import { useMemo, useState } from "react";
import { CheckCircle2, Scale, TriangleAlert } from "lucide-react";
import { Money } from "@/components/Money";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { canIAfford } from "@/lib/forecast";
import { addDaysIso, fmtDate, pick } from "@/lib/l10n";
import { loadProfile } from "@/lib/profile";
import { buildOutlook, outlookInput } from "@/lib/outlook-data";

/** "Can I afford it?": re-runs the same forecast with one extra payment. Plain code, no AI. */
export function AffordCheck() {
  const { lang } = useLanguage();
  const L = (en: string, ar: string) => pick(lang, en, ar);
  const [amount, setAmount] = useState("150");
  const [when, setWhen] = useState<"week" | "later">("week");
  const [asked, setAsked] = useState<{ amount: number; when: "week" | "later" } | null>({ amount: 150, when: "week" });
  const input = useMemo(() => outlookInput(loadProfile()), []);
  const base = useMemo(() => buildOutlook(loadProfile()), []);
  const risk = base.risks[0];
  const dateFor = (w: "week" | "later") => w === "week" ? addDaysIso(base.today, 1) : addDaysIso(risk?.lowestDay ?? base.today, 1);
  const result = useMemo(() => {
    if (!asked) return null;
    const now = canIAfford(input, { date: dateFor(asked.when), amount: asked.amount, name: "Planned spend" });
    const later = risk ? canIAfford(input, { date: addDaysIso(risk.lowestDay, 1), amount: asked.amount, name: "Planned spend" }) : null;
    return { now, later };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asked, input]);
  const submit = (e: React.FormEvent) => { e.preventDefault(); const n = Math.round(Number(amount)); if (n > 0 && n < 100000) setAsked({ amount: n, when }); };
  return (
    <section aria-labelledby="afford-title" className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-primary"><Scale aria-hidden className="size-6" /></span>
        <div><h2 id="afford-title" className="text-2xl font-bold text-secondary">{L("Can I afford it?", "هل أستطيع تحمّل ذلك؟")}</h2>
          <p className="text-base text-muted-foreground">{L("Checks a payment against your 90-day forecast, including bad weeks.", "يفحص أي دفعة مقابل توقعاتك لـ٩٠ يومًا، بما فيها الأسابيع الصعبة.")}</p></div>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <label className="block"><span className="mb-1 block text-base font-bold">{L("Amount", "المبلغ")}</span>
          <span dir="ltr" className="flex min-h-12 items-center rounded-xl border-2 border-input bg-card px-3 focus-within:ring-4 focus-within:ring-ring">
            <span className="text-lg font-bold text-muted-foreground">£</span>
            <input inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ""))} className="w-full bg-transparent px-2 text-lg font-bold outline-none" aria-label={L("Amount in pounds", "المبلغ بالجنيه")} />
          </span>
        </label>
        <div className="flex flex-wrap gap-3">
        <div role="radiogroup" aria-label={L("When", "متى")} className="flex rounded-xl bg-muted p-1">
          {(["week", "later"] as const).map(w => <button key={w} type="button" role="radio" aria-checked={when === w} onClick={() => setWhen(w)} className={"min-h-10 rounded-lg px-3 text-base font-bold transition-colors " + (when === w ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}>{w === "week" ? L("This week", "هذا الأسبوع") : L("After " + (risk ? fmtDate(lang, risk.lowestDay) : ""), "بعد " + (risk ? fmtDate(lang, risk.lowestDay) : ""))}</button>)}
        </div>
        <Button type="submit" className="min-h-12 flex-1 rounded-xl px-6 text-lg font-bold">{L("Check", "افحص")}</Button>
        </div>
      </form>
      {result && asked && <div aria-live="polite" className={"rounded-2xl p-4 " + (result.now.affordable ? "bg-primary/10" : "bg-destructive/10")}>
        {result.now.affordable ? <p className="flex items-start gap-2 text-lg"><CheckCircle2 aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" /><span><b>{L("Yes.", "نعم.")}</b> {L("Even in bad weeks you stay above £0.", "حتى في الأسابيع الصعبة يبقى رصيدك فوق الصفر.")}</span></p>
        : <div className="space-y-2">
            <p className="flex items-start gap-2 text-lg"><TriangleAlert aria-hidden className="mt-0.5 size-6 shrink-0 text-destructive" /><span><b>{L("Not right now.", "ليس الآن.")}</b> {L("Paying", "دفع")} <Money amount={asked.amount} /> {asked.when === "week" ? L("this week", "هذا الأسبوع") : ""} {L("makes your gap bigger:", "يزيد الفجوة:")} <Money amount={result.now.gapBefore} /> → <b className="text-destructive"><Money amount={result.now.gapAfter} /></b></span></p>
            {asked.when === "week" && result.later && risk && <p className="ps-8 text-lg">{result.later.gapAfter <= result.later.gapBefore
              ? <>{L("If it can wait until after", "إذا أمكن الانتظار حتى بعد")} {fmtDate(lang, risk.lowestDay, { day: "numeric", month: "long" })}, {L("it won't add to this", "لن يزيد هذه الفجوة البالغة")} <Money amount={result.later.gapBefore} /> {L("gap.", "")}</>
              : <>{L("Even later, it adds to the gap. A smaller amount would help.", "حتى لاحقًا يزيد الفجوة. مبلغ أصغر سيساعد.")}</>}</p>}
          </div>}
        <p className="mt-3 text-sm text-muted-foreground">{L("Worked out by the forecast code, not AI. Not financial advice.", "محسوب بشيفرة التوقعات، وليس بالذكاء الاصطناعي. ليست نصيحة مالية.")}</p>
      </div>}
    </section>
  );
}
