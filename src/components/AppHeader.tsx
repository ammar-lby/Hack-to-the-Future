import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/i18n";
import { languageOptions, type Lang } from "@/i18n/translations";

export function AppHeader() {
  const { lang, setLang, t } = useLanguage();
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card">
      <div className="mx-auto grid grid-cols-[minmax(0,1fr)_auto] max-w-xl items-center gap-3 px-4 py-3">
        <Link to="/dashboard" className="flex min-h-12 min-w-0 items-center rounded-md text-xl font-bold text-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">
          {t("appName")}
        </Link>
        <select
          aria-label={t("language")}
          value={lang}
          onChange={(event) => setLang(event.target.value as Lang)}
          className="min-h-12 min-w-0 max-w-40 rounded-xl border-2 border-secondary bg-card px-3 text-lg font-bold text-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value} lang={option.value}>{t(option.labelKey)}</option>
          ))}
        </select>
      </div>
    </header>
  );
}
