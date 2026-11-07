import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bolt, Bus, Home, Send, ShoppingBasket, type LucideIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Money, MoneyModeToggle } from "@/components/Money";
import { SpeakButton } from "@/components/SpeakButton";
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
  useEffect(() => { const saved = loadProfile(); setData(saved ? buildDashboard(saved) : null); }, []);
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-xl space-y-6 px-4 pb-28 pt-6">
        {/* Reserved slot: "Message from Future You" card goes here. */}
        <div id="future-you-message" />
        <MoneyModeToggle />
        {data === null && <section className="rounded-3xl border border-border bg-card p-6">
          <h1 className="text-3xl font-bold text-secondary">{t("dashboardTitle")}</h1>
          <p className="mt-3 text-lg">{t("noProfile")}</p>
          <Button asChild className="mt-6 min-h-14 rounded-2xl text-lg font-bold"><Link to="/setup">{t("startSetup")}</Link></Button>
        </section>}
        {data && <DashboardBody data={data} />}
      </main>
      <BottomNav />
    </>
  );
}

function DashboardBody({ data }: { data: DashboardData }) {
  const { t } = useLanguage();
  const total = data.spending || 1;
  const say = (n: number) => `${Math.round(n * 100) / 100} ${t("poundsWord")}`;
  const fill = (k: Parameters<typeof t>[0], v: Record<string, string>) => Object.entries(v).reduce((a, [x, y]) => a.replace(`{${x}}`, y), t(k));
  return <>
    <h1 className="text-3xl font-bold text-secondary">{t("greeting")}, {data.name}</h1>
    <section className="rounded-3xl bg-secondary p-6 text-secondary-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold opacity-90">{t("currentBalance")}</h2><SpeakButton id="balance" label={t("currentBalance")} text={fill("sayBalance", { amount: say(data.balance) })} inverted /></div>
      <p className="mt-1 text-4xl font-bold"><Money amount={data.balance} /></p>
    </section>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold text-muted-foreground">{t("incomeThisMonth")}</h2><SpeakButton id="income" label={t("incomeThisMonth")} text={fill("sayIncome", { amount: say(data.income) })} /></div>
        <p className="mt-1 text-3xl font-bold text-primary"><Money amount={data.income} /></p>
      </section>
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold text-muted-foreground">{t("spendingThisMonth")}</h2><SpeakButton id="spending" label={t("spendingThisMonth")} text={fill("saySpending", { amount: say(data.spending) })} /></div>
        <p className="mt-1 text-3xl font-bold text-secondary"><Money amount={data.spending} /></p>
      </section>
    </div>
    {data.estimated && <p className="text-base text-muted-foreground">{t("estimateNotice")}</p>}

    <section aria-labelledby="split-heading" className="space-y-4">
      <h2 id="split-heading" className="text-2xl font-bold text-secondary">{t("spendingSplit")}</h2>
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div role="img" aria-label={t("spendingChartLabel")} className="relative mx-auto h-56 w-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.categories} dataKey="amount" nameKey="key" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="none" isAnimationActive={false}>
                {data.categories.map((c) => <Cell key={c.key} fill={categoryStyle[c.key].color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-secondary"><Money amount={data.spending} /></div>
        </div>
      </div>
      <ul className="space-y-3">
        {data.categories.map((c) => {
          const { icon: Icon, color } = categoryStyle[c.key];
          const pct = Math.round((c.amount / total) * 100);
          return <li key={c.key} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-secondary"><Icon aria-hidden className="size-6" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg font-bold">{t(c.key)}</h3>
                  <span className="text-xl font-bold"><Money amount={c.amount} /></span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={t(c.key)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-base text-muted-foreground"><bdi dir="ltr">{pct}%</bdi> {t("ofSpending")}</p>
                  <SpeakButton id={c.key} label={t(c.key)} text={fill("sayCategory", { category: t(c.key), amount: say(c.amount), pct: String(pct) })} />
                </div>
              </div>
            </div>
          </li>;
        })}
      </ul>
    </section>

    <section className="rounded-3xl border border-dashed border-border bg-card p-6">
      <h2 className="text-2xl font-bold text-secondary">{t("outlookTitle")}</h2>
      <p className="mt-2 text-lg text-muted-foreground">{t("outlookSoon")}</p>
    </section>
    <section className="rounded-3xl border border-dashed border-border bg-card p-6">
      <h2 className="text-2xl font-bold text-secondary">{t("coachTitle")}</h2>
      <p className="mt-2 text-lg text-muted-foreground">{t("coachSoon")}</p>
    </section>
  </>;
}
