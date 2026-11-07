import { Link } from "@tanstack/react-router";
import { Home, LineChart, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const items = [
  { to: "/dashboard", label: "navHome", icon: Home },
  { to: "/outlook", label: "navOutlook", icon: LineChart },
  { to: "/coach", label: "navCoach", icon: MessageCircle },
] as const;

/** Bottom tab bar on phones; left sidebar on laptops (lg and up). */
export function BottomNav() {
  const { t } = useLanguage();
  return (
    <nav aria-label={t("appName")} className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 shadow-[0_-4px_16px_rgba(66,20,95,0.08)] backdrop-blur lg:inset-x-auto lg:start-0 lg:top-[4.5rem] lg:flex lg:w-60 lg:flex-col lg:border-e lg:border-t-0 lg:bg-card lg:shadow-none">
      <ul className="mx-auto grid max-w-xl grid-cols-3 lg:mx-0 lg:mt-6 lg:flex lg:max-w-none lg:flex-col lg:gap-1 lg:px-3">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="flex min-h-16 flex-col items-center justify-center gap-1 text-base font-bold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-xl lg:px-4 lg:hover:bg-muted"
              activeProps={{ className: "text-primary lg:bg-muted [&_svg]:rounded-full [&_svg]:bg-muted [&_svg]:p-1 [&_svg]:size-8 lg:[&_svg]:bg-transparent lg:[&_svg]:p-0 lg:[&_svg]:size-6", "aria-current": "page" }}>
              <Icon aria-hidden className="size-6" />{t(label)}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-auto hidden px-6 pb-6 text-sm text-muted-foreground lg:block">{t("coachDisclaimer")}</p>
    </nav>
  );
}
