import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Money } from "@/components/Money";
import { SpeakButton } from "@/components/SpeakButton";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useLanguage, dirFor, type StringKey } from "@/lib/i18n";
import { loadProfile } from "@/lib/profile";
import { buildOutlook, riskWeeks, weekOf, type OutlookData } from "@/lib/outlook-data";

const eventKeys: Record<string, StringKey> = { Pay: "outlookPay", Rent: "rent", Phone: "phone", "Money sent home": "moneyHome", "Car insurance (annual)": "outlookInsurance", "Planned spend": "outlookPlanned" };

export function Outlook({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useLanguage();
  const [state, setState] = useState<{ data: OutlookData; demo: boolean } | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    try { const saved = loadProfile(); setState({ data: buildOutlook(saved), demo: saved?.source !== "adam" }); setFailed(false); } catch { setFailed(true); }
  }, [attempt]);
  const [index, setIndex] = useState(20);
  const formatDate = (iso: string) => new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  const eventName = (name: string) => t(eventKeys[name] ?? "catBills");
  const chartDays = useMemo(() => state?.data.days.map((day, i) => ({ ...day, index: i })), [state]);
  if (failed) return <div role="alert"><p>{t("errorBody")}</p><Button className="mt-3 min-h-12 text-lg" onClick={() => setAttempt(value => value + 1)}>{t("retry")}</Button></div>;
  if (!state || !chartDays) return <p role="status">{t("outlookLoading")}</p>;
  const { data } = state;
  const selected = data.days[index];
  if (!selected) return <p role="status">{t("outlookEmpty")}</p>;
  const weeks = riskWeeks(data);
  const isRisk = weeks.includes(weekOf(selected.date));
  const events = data.days.flatMap((day, i) => day.events.map(event => ({ ...event, date: day.date, index: i, expected: day.expected })));
  const nearbyBills = events.filter(event => event.amount < 0 && Math.abs(event.index - index) <= 3);
  const risk = data.risks[0];
  const reasons = risk?.bills.map(eventName).join(` ${t("outlookAnd")} `);
  const speech = risk ? `${t("outlookWeekOf")} ${formatDate(risk.week)}: ${reasons ? `${reasons} ${t("outlookTogether")}` : t("outlookLowIncome")} ${risk.shortfall} ${t("poundsWord")} ${t("outlookShort")} ${t("outlookSave")} ${risk.saveWeekly} ${t("poundsWord")} ${t("outlookWeeklyFor")} ${risk.weeksUntil} ${t("outlookWeeks")}.` : t("outlookNoRisk");
  return <section aria-label={t("outlookTitle")} className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      {compact ? <h2 className="text-2xl font-bold text-secondary">{t("outlookTitle")}</h2> : <h1 className="text-3xl font-bold text-secondary">{t("outlookTitle")}</h1>}
      <p className="text-base text-muted-foreground">{t("outlookAsOf")} <bdi>{formatDate(data.today)}</bdi></p>
    </div>
    {state.demo && <p className="text-lg text-muted-foreground">{t("outlookDemoNotice")}</p>}
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-lg font-bold">
      <span className="flex items-center gap-2"><span className="w-8 border-t-[3px] border-primary" />{t("outlookExpected")}</span>
      <span className="flex items-center gap-2"><span className="w-8 border-t-[3px] border-dashed border-secondary" />{t("outlookBadWeeks")}</span>
    </div>
    <div dir="ltr" role="img" aria-label={t("outlookChart")} className={compact ? "h-64 w-full min-w-0" : "h-80 w-full min-w-0"}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartDays} margin={{ top: 20, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis reversed={dirFor(lang) === "rtl"} type="number" dataKey="index" domain={[0, 89]} ticks={[0, 29, 59, 89]} tickFormatter={i => formatDate(data.days[i]?.date ?? data.today)} tick={{ fill: "var(--muted-foreground)", fontSize: 14 }} tickLine={false} axisLine={false} />
          <YAxis width={78} tickCount={4} axisLine={false} tickLine={false} tick={({ x, y, payload }) => <g><foreignObject x={Number(x) - 77} y={Number(y) - 20} width={75} height={44}><div className="text-end text-sm text-muted-foreground"><Money amount={Number(payload.value)} /></div></foreignObject></g>} />
          {weeks.map(week => {
            const indices = chartDays.filter(day => weekOf(day.date) === week).map(day => day.index);
            const first = indices[0], last = indices[indices.length - 1];
            if (first === undefined || last === undefined) return null;
            return <ReferenceArea key={week} x1={first} x2={last} fill="var(--destructive)" fillOpacity={0.12} strokeOpacity={0} />;
          })}
          <ReferenceLine y={0} stroke="var(--destructive)" strokeDasharray="3 4" />
          <Line type="linear" dataKey="expected" stroke="var(--primary)" strokeWidth={3} dot={false} isAnimationActive={false} />
          <Line type="linear" dataKey="badCase" stroke="var(--secondary)" strokeWidth={3} strokeDasharray="7 5" dot={false} isAnimationActive={false} />
          {events.map((event, i) => <ReferenceDot key={i} x={event.index} y={event.expected} r={event.amount > 0 ? 3 : 4} fill={event.amount > 0 ? "var(--primary)" : "var(--card)"} stroke="var(--secondary)" />)}
          {!compact && <ReferenceLine x={index} stroke="var(--muted-foreground)" strokeDasharray="2 3" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
    {risk && <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-destructive"><AlertTriangle className="size-5" aria-hidden />{t("outlookWeekOf")} {formatDate(risk.week)} · {t("outlookShortfall")} <Money amount={risk.shortfall} /></div>}
    {!compact && <>
      <div>
        <h2 className="mb-2 text-lg font-bold text-secondary">{t("outlookTimeline")}</h2>
        <div className="flex gap-2 overflow-x-auto pb-3" aria-label={t("outlookTimeline")}>
          {events.map((event, i) => <Button key={i} variant="outline" onClick={() => setIndex(event.index)} className="h-auto min-h-16 shrink-0 flex-col items-start gap-0 rounded-lg px-3 py-2 text-base" aria-pressed={index === event.index}><span className="text-muted-foreground">{formatDate(event.date)}</span><span>{eventName(event.name)}</span></Button>)}
        </div>
      </div>
      <div className="border-y border-border py-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><label id="look-ahead" className="text-xl font-bold text-secondary">{t("outlookExplore")}</label><span>{(index + 1) % 7 === 0 ? t("outlookWeeksAhead").replace("{weeks}", String((index + 1) / 7)) : t("outlookDaysAhead").replace("{days}", String(index + 1))}</span></div>
        <Slider dir={dirFor(lang)} aria-labelledby="look-ahead" aria-valuetext={formatDate(selected.date)} min={0} max={89} step={1} value={[index]} onValueChange={value => { if (value[0] !== undefined) setIndex(value[0]); }} className="my-3 min-h-12 [&_[role=slider]]:size-11 [&_[role=slider]]:border-2" />
        <div className="space-y-4" aria-live="polite">
          <div className="flex flex-wrap items-center gap-3"><h3 className="flex items-center gap-2 text-xl font-bold"><CalendarDays className="size-5" aria-hidden />{formatDate(selected.date)}</h3>{isRisk && <span className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-base font-bold text-destructive"><AlertTriangle className="size-4" aria-hidden />{t("outlookRiskBadge")}</span>}</div>
          <dl className="grid grid-cols-2 gap-4"><div><dt className="text-lg text-muted-foreground">{t("outlookExpected")}</dt><dd className="text-2xl font-bold text-primary"><Money amount={selected.expected} /></dd></div><div><dt className="text-lg text-muted-foreground">{t("outlookBadWeeks")}</dt><dd className={isRisk ? "text-2xl font-bold text-destructive" : "text-2xl font-bold text-secondary"}><Money amount={selected.badCase} /></dd></div></dl>
          <h4 className="text-lg font-bold">{t("outlookAround")}</h4>
          {nearbyBills.length ? <ul className="space-y-2">{nearbyBills.map((bill, i) => <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2"><span>{eventName(bill.name)} <span className="text-base text-muted-foreground">· {formatDate(bill.date)}</span></span><Money amount={-bill.amount} className="font-bold" /></li>)}</ul> : <p className="text-lg text-muted-foreground">{t("outlookNoBills")}</p>}
        </div>
      </div>
    </>}
    <div className="space-y-3 border-s-4 border-primary ps-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><h2 className="text-xl font-bold text-secondary">{risk ? t("outlookNextRisk") : t("outlookTitle")}</h2><SpeakButton id={compact ? "outlook-preview" : "outlook-summary"} text={speech} label={t("outlookNextRisk")} /></div>
      {risk ? <>
        <p className="text-lg leading-relaxed">{t("outlookWeekOf")} {formatDate(risk.week)}: {reasons ? `${reasons} ${t("outlookTogether")}` : t("outlookLowIncome")} <Money amount={risk.shortfall} className="font-bold" /> {t("outlookShort")}</p>
        <p className="text-lg"><span className="font-bold">{t("outlookFix")}: </span>{t("outlookSave")} <Money amount={risk.saveWeekly} className="font-bold" /> {t("outlookWeeklyFor")} {risk.weeksUntil} {t("outlookWeeks")}.</p>
      </> : <p className="flex items-start gap-2 text-lg"><CheckCircle2 className="mt-1 size-6 shrink-0 text-primary" aria-hidden />{t("outlookNoRisk")}</p>}
    </div>
    {compact && <Button asChild variant="outline" className="min-h-14 w-full text-lg"><Link to="/outlook">{t("outlookOpen")}<ArrowUpRight aria-hidden className="rtl:-rotate-90" /></Link></Button>}
  </section>;
}