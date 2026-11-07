import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Money } from "@/components/Money";
import { useLanguage, type StringKey } from "@/lib/i18n";
import { billKeys, emptyProfile, loadDraft, loadProfile, saveDraft, saveProfile, useAdamProfile, validateStep, incomeRanges, rangeValue, resolveIncome, type IncomeValue, type Profile, type IncomeType, type Variation } from "@/lib/profile";

const titles: StringKey[] = ["aboutYou", "income", "mainBills", "transport", "food", "moneyHome", "currentBalance"];
const incomeTypes: IncomeType[] = ["weeklyGig", "shiftWork", "zeroHours", "other"];
const variations: Variation[] = ["steady", "variesBit", "variesLot"];

export function ProfileSetup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<StringKey | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const draft = loadDraft();
    const saved = loadProfile();
    if (draft) { setProfile(draft.profile); setStep(draft.step); }
    else if (saved?.source === "personal") setProfile(saved.profile);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || step === 7) return;
    try { saveDraft(profile, step); } catch { setError("saveError"); }
  }, [profile, step, ready]);
  useEffect(() => { if (ready) heading.current?.focus(); }, [step, ready]);
  function update(key: keyof Profile, value: string) {
    setError(null);
    setProfile((previous) => ({ ...previous, [key]: value }));
  }
  function next(event: FormEvent) {
    event.preventDefault();
    const validation = validateStep(profile, step);
    if (validation) { setError(validation); window.requestAnimationFrame(() => document.getElementById("setup-error")?.focus()); return; }
    try {
      if (step === 6) saveProfile({ ...profile, firstName: profile.firstName.trim() });
      else saveDraft(profile, step + 1);
      setError(null); setStep(step + 1);
    } catch { setError("saveError"); }
  }
  function demo() {
    try { useAdamProfile(); navigate({ to: "/dashboard" }); }
    catch { setError("saveError"); }
  }
  function amount(key: "monthlyTransport" | "weeklyFood" | "monthlyRemittance" | "currentBalance", label: StringKey, optional = false) {
    return <div className="space-y-3">
      <label htmlFor={key} className="block text-lg font-bold">{t(label)}</label>
      <Input id={key} name={key} type="number" inputMode="decimal" step="0.01" min={key === "currentBalance" ? undefined : 0} required={!optional} value={profile[key]} onChange={(event) => update(key, event.target.value)} className="h-16 rounded-2xl bg-card px-5 text-xl md:text-xl focus-visible:ring-4" />
    </div>;
  }
  if (!ready) return <p role="status" className="mx-auto max-w-xl px-4 py-8">{t("setupLoading")}</p>;
  return <div className="mx-auto max-w-xl px-4 py-8">
    <div className="mb-8">
      <p className="mb-3 text-lg font-bold text-muted-foreground">{t("step")} {Math.min(step + 1, 7)} {t("of")} 7</p>
      <div role="progressbar" aria-label={t("setupTitle")} aria-valuemin={0} aria-valuemax={7} aria-valuenow={Math.min(step + 1, 7)} className="grid h-3 grid-cols-7 gap-1.5 overflow-hidden rounded-full">
        {titles.map((title, index) => <div key={title} className={index < step ? "bg-primary" : index === step ? "bg-accent" : "bg-border"} />)}
      </div>
    </div>
    <h1 ref={heading} tabIndex={-1} className="mb-8 text-3xl font-bold text-secondary outline-none">{t(step === 7 ? "allSet" : titles[step] ?? "aboutYou")}</h1>
    {step === 7 ? <>
      <Check aria-hidden className="mb-8 size-16 rounded-full bg-primary p-3 text-primary-foreground" />
      <Button asChild className="min-h-16 w-full rounded-2xl bg-accent text-xl font-bold text-accent-foreground hover:bg-accent/90"><Link to="/dashboard">{t("goDashboard")}<ArrowRight className="rtl:rotate-180" /></Link></Button>
    </> : <form onSubmit={next} noValidate className="space-y-8">
      {step === 0 && <>
        <div className="space-y-3"><label htmlFor="firstName" className="block text-lg font-bold">{t("firstName")}</label><Input id="firstName" autoComplete="given-name" value={profile.firstName} onChange={(event) => update("firstName", event.target.value)} className="h-16 rounded-2xl bg-card px-5 text-xl md:text-xl focus-visible:ring-4" /></div>
        <Button type="button" onClick={demo} className="h-auto min-h-16 w-full whitespace-normal rounded-2xl bg-accent px-4 py-4 text-xl font-bold text-accent-foreground hover:bg-accent/90"><Sparkles aria-hidden />{t("useDemo")}</Button>
      </>}
      {step === 1 && <>
        <fieldset><legend className="mb-3 text-lg font-bold">{t("incomeType")}</legend><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{incomeTypes.map((value) => <Button type="button" key={value} variant={profile.incomeType === value ? "default" : "outline"} aria-pressed={profile.incomeType === value} onClick={() => update("incomeType", value)} className="h-auto min-h-16 whitespace-normal rounded-2xl px-4 py-3 text-lg font-bold">{t(value)}</Button>)}</div></fieldset>
        <IncomeRanges profile={profile} onChange={(key, value) => { setError(null); setProfile((previous) => ({ ...previous, [key]: value })); }} />
        <fieldset><legend className="mb-3 text-lg font-bold">{t("incomeVariation")}</legend><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{variations.map((value) => <Button type="button" key={value} variant={profile.variation === value ? "default" : "outline"} aria-pressed={profile.variation === value} onClick={() => update("variation", value)} className="h-auto min-h-16 whitespace-normal rounded-2xl px-3 py-3 text-lg font-bold">{t(value)}</Button>)}</div></fieldset>
      </>}
      {step === 2 && <div className="divide-y divide-border">{billKeys.map((key) => <fieldset key={key} className="pb-6 pt-4 first:pt-0"><legend className="text-xl font-bold text-secondary">{t(key)}</legend><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label htmlFor={`${key}-amount`} className="mb-2 block text-lg">{t("monthlyAmount")}</label><Input id={`${key}-amount`} type="number" inputMode="decimal" min={0} step="0.01" value={profile.bills[key].amount} onChange={(event) => { setError(null); setProfile((previous) => ({ ...previous, bills: { ...previous.bills, [key]: { ...previous.bills[key], amount: event.target.value } } })); }} className="h-16 rounded-2xl bg-card text-xl md:text-xl" /></div>
        <div><label htmlFor={`${key}-day`} className="mb-2 block text-lg">{t("dueDay")}</label><Input id={`${key}-day`} type="number" inputMode="numeric" min={1} max={31} step={1} value={profile.bills[key].day} onChange={(event) => { setError(null); setProfile((previous) => ({ ...previous, bills: { ...previous.bills, [key]: { ...previous.bills[key], day: event.target.value } } })); }} className="h-16 rounded-2xl bg-card text-xl md:text-xl" /></div>
      </div></fieldset>)}</div>}
      {step === 3 && amount("monthlyTransport", "monthlyTransport")}
      {step === 4 && amount("weeklyFood", "weeklyFood")}
      {step === 5 && amount("monthlyRemittance", "monthlyRemittance", true)}
      {step === 6 && amount("currentBalance", "balanceAmount")}
      {error && <p id="setup-error" tabIndex={-1} role="alert" className="text-lg font-bold text-destructive focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">{t(error)}</p>}
      <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={() => { setError(null); if (step > 0) setStep(step - 1); else navigate({ to: "/currency" }); }} className="min-h-16 flex-1 rounded-2xl text-xl font-bold"><ArrowLeft aria-hidden className="rtl:rotate-180" />{t("back")}</Button>
        <Button type="submit" className="h-auto min-h-16 flex-1 whitespace-normal rounded-2xl text-xl font-bold">{t(step === 6 ? "finish" : "next")}<ArrowRight aria-hidden className="rtl:rotate-180" /></Button>
      </div>
    </form>}
  </div>;
}
const incomeRows = [["incomeLow", "lowWeek"], ["incomeTypical", "typicalWeek"], ["incomeHigh", "goodWeek"]] as const;
type IncomeKey = (typeof incomeRows)[number][0];

function IncomeRanges({ profile, onChange }: { profile: Profile; onChange: (key: IncomeKey, value: IncomeValue) => void }) {
  const { t } = useLanguage();
  const resolved = resolveIncome(profile);
  const answered = incomeRows.every(([key]) => profile[key] !== "");
  const orderBad = answered && resolved && (resolved.low > resolved.typical || resolved.typical > resolved.high);
  const anyEstimated = answered && resolved && Object.values(resolved.estimated).some(Boolean);
  const chip = "h-auto min-h-14 whitespace-normal rounded-full px-4 py-2 text-lg font-bold";
  return <section aria-labelledby="income-range-q" className="space-y-6">
    <div>
      <h2 id="income-range-q" className="text-xl font-bold text-secondary">{t("takeHomeQuestion")}</h2>
      <p className="mt-2 text-lg text-muted-foreground">{t("takeHomeHelper")}</p>
    </div>
    {incomeRows.map(([key, label]) => <fieldset key={key}>
      <legend className="mb-3 text-lg font-bold">{t(label)}</legend>
      <div className="flex flex-wrap gap-2">
        {incomeRanges[key].map((range) => {
          const value = rangeValue(range);
          const selected = profile[key] === value;
          return <Button type="button" key={range.id} variant={selected ? "default" : "outline"} aria-pressed={selected} onClick={() => onChange(key, value)} className={chip}>
            {range.min === null ? <>{t("under")} <Money amount={range.max as number} /></> : range.max === null ? <><Money amount={range.min} /> {t("orMore")}</> : <span dir="ltr" className="inline-flex items-center gap-1"><Money amount={range.min} />–<Money amount={range.max} /></span>}
          </Button>;
        })}
        <Button type="button" variant={profile[key] === null ? "default" : "outline"} aria-pressed={profile[key] === null} onClick={() => onChange(key, null)} className={chip}>{t("notSure")}</Button>
      </div>
    </fieldset>)}
    <div aria-live="polite" className="space-y-2">
      {answered && resolved && <p className="rounded-2xl bg-muted p-4 text-lg font-bold">{t("rangeFrom")} <Money amount={resolved.low} /> {t("rangeTo")} <Money amount={resolved.high} /> {t("rangeTypical")} <Money amount={resolved.typical} />.</p>}
      {anyEstimated && <p className="text-base text-muted-foreground">{t("estimatedNote")}</p>}
      {orderBad && <p role="alert" className="text-lg font-bold text-destructive">{t("incomeOrderError")}</p>}
    </div>
  </section>;
}
