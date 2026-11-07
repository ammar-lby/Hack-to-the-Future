import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/i18n";
import { languageOptions, type Lang } from "@/i18n/translations";

/** Original Future You mark: a rising line inside a rounded square. */
function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="size-9 shrink-0">
      <rect width="32" height="32" rx="9" fill="white" />
      <path d="M7 21 L13 15 L17 18 L25 9" fill="none" stroke="oklch(0.4 0.14 310)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25" cy="9" r="2.6" fill="oklch(0.6 0.2 345)" />
    </svg>
  );
}

export function AppHeader() {
  const { lang, setLang, t } = useLanguage();
  return (
    <header className="brand-bar sticky top-0 z-10 text-white shadow-md">
      <div className="mx-auto grid max-w-xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Link to="/dashboard" className="flex min-h-12 min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">
          <LogoMark />
          <span className="min-w-0">
            <span className="block truncate text-xl font-bold leading-tight">{t("appName")}</span>
            <span className="block truncate text-xs font-bold uppercase tracking-wider text-white/75" dir="ltr">NatWest challenge</span>
          </span>
        </Link>
        <select
          aria-label={t("language")}
          value={lang}
          onChange={(event) => setLang(event.target.value as Lang)}
          className="min-h-12 min-w-0 max-w-40 rounded-xl border-2 border-white/40 bg-white/10 px-3 text-lg font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring [&>option]:text-foreground"
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value} lang={option.value}>{t(option.labelKey)}</option>
          ))}
        </select>
      </div>
    </header>
  );
}
