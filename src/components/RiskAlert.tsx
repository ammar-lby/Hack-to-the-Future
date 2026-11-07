import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BellRing, ChevronRight, X } from "lucide-react";
import { Money } from "@/components/Money";
import { useLanguage } from "@/lib/i18n";
import { fmtDate, pick } from "@/lib/l10n";
import { loadProfile } from "@/lib/profile";
import { buildOutlook, type OutlookData } from "@/lib/outlook-data";

/** Proactive alert strip: the forecast found a short week, so the app tells you first. */
export function RiskAlert() {
  const { lang } = useLanguage();
  const [data, setData] = useState<OutlookData | null>(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => { try { setData(buildOutlook(loadProfile())); } catch { /* no data */ } }, []);
  const risk = data?.risks[0];
  if (!risk || hidden) return null;
  const L = (en: string, ar: string) => pick(lang, en, ar);
  return (
    <div role="status" className="flex items-center gap-3 rounded-2xl border border-destructive/25 bg-card p-3 pe-2 shadow-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><BellRing aria-hidden className="size-5" /></span>
      <p className="min-w-0 flex-1 text-base leading-snug">
        <b>{L("Heads up:", "تنبيه:")}</b> {L("week of", "أسبوع")} {fmtDate(lang, risk.week)} {L("you may be", "قد ينقصك")} <b className="text-destructive"><Money amount={risk.shortfall} /></b> {L("short in a bad week.", "في أسبوع صعب.")}
      </p>
      <Link to="/outlook" className="hidden min-h-10 shrink-0 items-center gap-1 rounded-full bg-muted px-4 text-base font-bold text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring sm:flex">{L("See plan", "عرض الخطة")}<ChevronRight aria-hidden className="size-4 rtl:rotate-180" /></Link>
      <button type="button" onClick={() => setHidden(true)} aria-label={L("Dismiss", "إغلاق")} className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"><X aria-hidden className="size-5" /></button>
    </div>
  );
}
