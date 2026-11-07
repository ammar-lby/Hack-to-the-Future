import { Link } from "@tanstack/react-router";
import { Home, LineChart, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const items = [
  { to: "/dashboard", label: "navHome", icon: Home },
  { to: "/outlook", label: "navOutlook", icon: LineChart },
  { to: "/coach", label: "navCoach", icon: MessageCircle },
] as const;

export function BottomNav() {
  const { t } = useLanguage();
  return (
    <nav aria-label={t("appName")} className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 shadow-[0_-4px_16px_rgba(66,20,95,0.08)] backdrop-blur">
      <ul className="mx-auto grid max-w-xl grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="flex min-h-16 flex-col items-center justify-center gap-1 text-base font-bold text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring" activeProps={{ className: "text-primary [&_svg]:rounded-full [&_svg]:bg-muted [&_svg]:p-1 [&_svg]:size-8", "aria-current": "page" }}>
              <Icon aria-hidden className="size-6" />{t(label)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
