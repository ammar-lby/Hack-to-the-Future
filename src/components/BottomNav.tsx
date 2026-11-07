import { Link } from "@tanstack/react-router";
import { Home, LineChart, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { loadDemoState, useDemoRevision } from "@/lib/simulate";

const items = [
  { to: "/dashboard", label: "navHome", icon: Home },
  { to: "/outlook", label: "navOutlook", icon: LineChart },
  { to: "/coach", label: "navCoach", icon: MessageCircle },
] as const;

export function BottomNav() {
  const { t } = useLanguage();
  const revision = useDemoRevision();
  const [changed, setChanged] = useState(false);
  useEffect(() => { setChanged(loadDemoState().changed); }, [revision]);
  return (
    <nav aria-label={t("appName")} className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card">
      <ul className="mx-auto grid max-w-xl grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="flex min-h-16 flex-col items-center justify-center gap-1 text-base font-bold text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring" activeProps={{ className: "text-primary", "aria-current": "page" }}>
              <span className="relative"><Icon aria-hidden className="size-6" />{to === "/dashboard" && changed && <span aria-label={t("demoNewRisk")} className="absolute -end-2 -top-1 size-3 rounded-full bg-destructive ring-2 ring-card" />}</span>{t(label)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
