import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bolt, Bus, Home, Send, ShoppingBasket, type LucideIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Money, MoneyModeToggle } from "@/components/Money";
import { SpeakButton } from "@/components/SpeakButton";
import { Outlook } from "@/components/Outlook";
import { FutureMessage } from "@/components/FutureMessage";
import { EmergencyPot } from "@/components/EmergencyPot";
import { RiskAlert } from "@/components/RiskAlert";
import { buildOutlook } from "@/lib/outlook-data";
import { displayName } from "@/lib/l10n";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { loadProfile } from "@/lib/profile";
import { buildDashboard, type CategoryKey, type Dashboard as DashboardData } from "@/lib/dashboard-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Future You" },
      { name: "description", content: "Your balance, income and spending this month." },
      { property: "og:title", content: "Dashboard — Future You" },
      { property: "og:description", content: "Your balance, income and spending this month." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const categoryStyle: Record<CategoryKey, { icon: LucideIcon; color: string }> = {
  catRent: { icon: Home, color: "var(--chart-1)" },
  catFood: { icon: ShoppingBasket, color: "var(--chart-2)" },
  catTransport: { icon: Bus, color: "var(--chart-3)" },
  catBills: { icon: Bolt, color: "var(--chart-4)" },
  catHome: { icon: Send, color: "var(--chart-5)" },
};

function Dashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { try { const saved = loadProfile(); setData(saved ? buildDashboard(saved) : null); setFailed(false); } catch { setFailed(true); } }, [attempt]);
  return (
    <>
      <AppHeader />
      <div className="lg:ps-60">
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-28 pt-6 lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-8 lg:px-8 lg:pb-12 lg:pt-10">
        <aside id="future-you-message" className="space-y-6 lg:col-start-2 lg:row-start-1"><FutureMessage /><PotSlot /></aside>
        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
        {data && <RiskAlert />}
        <MoneyModeToggle />
        {failed ? <div role="alert"><p>{t("errorBody")}</p><Button className="mt-3 min-h-12 text-lg" onClick={() => setAttempt(value => value + 1)}>{t("retry")}</Button></div> : data === undefined && <p role="status">{t("dashboardLoading")}</p>}
        {data === null && <section className="rounded-3xl border border-border bg-card p-6">
          <h1 className="text-3xl font-bold text-secondary">{t("dashboardTitle")}</h1>
          <p className="mt-3 text-lg">{t("noProfile")}</p>
          <Button asChild className="mt-6 min-h-14 rounded-2xl text-lg font-bold"><Link to="/setup">{t("startSetup")}</Link></Button>
        </section>}
        {data && <DashboardBody data={data} />}
        </div>
      </div>
      </div>
      <BottomNav />
    </>
  );
}

function PotSlot() {
  const [data, setData] = useState<ReturnType<typeof buildOutlook> | null>(null);
  useEffect(() => { try { setData(buildOutlook(loadProfile())); } catch { /* no data */ } }, []);
  return data ? <div className="hidden lg:block"><EmergencyPot data={data} /></div> : null;
}

function DashboardBody({ data }: { data: DashboardData }) {
  const { t, lang } = useLanguage();
  const total = data.spending || 1;
  const slices = data.categories.filter((c) => c.amount > 0);
  const say = (n: number) => `${Math.round(n * 100) / 100} ${t("poundsWord")}`;
  const fill = (k: Parameters<typeof t>[0], v: Record<string, string>) => Object.entries(v).reduce((a, [x, y]) => a.replace(`{${x}}`, y), t(k));
  return <>
    <h1 className="break-words text-3xl font-bold text-secondary">{t("greeting")}{lang === "ar" ? "، " : ", "}<bdi>{displayName(lang, data.name)}</bdi></h1>
    <section className="brand-hero rounded-3xl p-6 text-secondary-foreground shadow-lg">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><h2 className="text-lg font-bold opacity-90">{t("currentBalance")}</h2><SpeakButton id="balance" label={t("currentBalance")} text={fill("sayBalance", { amount: say(data.balance) })} inverted /></div>
      <p className="mt-1 text-4xl font-bold"><Money amount={data.balance} /></p>
    </section>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><h2 className="text-lg font-bold text-muted-foreground">{t("incomeThisMonth")}</h2><SpeakButton id="income" label={t("incomeThisMonth")} text={fill("sayIncome", { amount: say(data.income) })} /></div>
        <p className="mt-1 text-3xl font-bold text-primary"><Money amount={data.income} /></p>
      </section>
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><h2 className="text-lg font-bold text-muted-foreground">{t("spendingThisMonth")}</h2><SpeakButton id="spending" label={t("spendingThisMonth")} text={fill("saySpending", { amount: say(data.spending) })} /></div>
        <p className="mt-1 text-3xl font-bold text-secondary"><Money amount={data.spending} /></p>
      </section>
    </div>
    {data.estimated && <p className="text-base text-muted-foreground">{t("estimateNotice")}</p>}

    <section aria-labelledby="split-heading" className="space-y-4">
      <h2 id="split-heading" className="text-2xl font-bold text-secondary">{t("spendingSplit")}</h2>
      {data.spending === 0 && <p role="status" className="text-lg text-muted-foreground">{t("spendingEmpty")}</p>}
      <div className="grid items-center gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm xl:grid-cols-[200px_minmax(0,1fr)]">
        <div role="img" aria-label={t("spendingChartLabel")} className="mx-auto size-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart aria-hidden="true" tabIndex={-1}>
              <Pie rootTabIndex={-1} data={slices} dataKey="amount" nameKey="key" outerRadius="95%" paddingAngle={1} stroke="var(--card)" strokeWidth={3} isAnimationActive
                labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  if (!percent || percent < 0.06) return null;
                  const r = innerRadius + (outerRadius - innerRadius) * 0.6, a = -(midAngle ?? 0) * Math.PI / 180;
                  return <text x={cx + r * Math.cos(a)} y={cy + r * Math.sin(a)} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700}>{Math.round(percent * 100)}%</text>;
                }}>
                {slices.map((c) => <Cell key={c.key} fill={categoryStyle[c.key].color} />)}
              </Pie>
              <Tooltip formatter={(value: number, key: string) => [`£${value.toFixed(2)}`, t(key as CategoryKey)]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="min-w-0 divide-y divide-border">
          {data.categories.map((c) => {
            const { color } = categoryStyle[c.key];
            const pct = Math.round((c.amount / total) * 100);
            return <li key={c.key} className="flex items-center gap-3 py-3">
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
              <span className="min-w-0 flex-1 text-lg font-bold leading-tight">{t(c.key)}</span>
              <span className="text-base text-muted-foreground"><bdi dir="ltr">{pct}%</bdi></span>
              <span className="text-end text-lg font-bold"><Money amount={c.amount} /></span>
              <SpeakButton id={c.key} label={t(c.key)} text={fill("sayCategory", { category: t(c.key), amount: say(c.amount), pct: String(pct) })} />
            </li>;
          })}
        </ul>
      </div>
    </section>

    <Outlook compact />
    <section className="brand-hero flex flex-col gap-4 rounded-3xl p-6 text-secondary-foreground shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-2xl font-bold">{t("coachTitle")}</h2><p className="mt-1 text-lg opacity-90">{t("coachEmpty")}</p></div>
      <Button asChild variant="secondary" className="min-h-12 shrink-0 rounded-full bg-white px-6 text-lg font-bold text-secondary hover:bg-white/90"><Link to="/coach">{t("futureTalk")}</Link></Button>
    </section>
  </>;
}
