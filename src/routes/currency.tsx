import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useLanguage } from "@/lib/i18n";
import { currencies, saveCurrency, type Currency } from "@/lib/currency";
import type { Lang } from "@/i18n/translations";

export const Route = createFileRoute("/currency")({
  head: () => ({ meta: [
    { title: "Home currency — Future You" },
    { name: "description", content: "Choose your home currency for your Future You money forecast." },
    { property: "og:title", content: "Home currency — Future You" },
    { property: "og:description", content: "Choose your home currency for your Future You money forecast." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CurrencySelection,
});

const REGION: Record<Currency, string> = {
  LYD: "LY", EGP: "EG", SAR: "SA", AED: "AE", INR: "IN", PKR: "PK", BDT: "BD", NGN: "NG", PHP: "PH", PLN: "PL", USD: "US", EUR: "EU", GBP: "GB", CAD: "CA",
};
function countryName(currency: Currency, lang: Lang) {
  try { return new Intl.DisplayNames([lang, "en"], { type: "region" }).of(REGION[currency]) ?? currency; } catch { return currency; }
}
// The 4 most likely home currencies for each app language; everything else sits under "More".
const SUGGESTED: Record<Lang, Currency[]> = {
  en: ["GBP", "NGN", "INR", "PHP"], ar: ["LYD", "EGP", "SAR", "AED"], hi: ["INR"], bn: ["BDT"], ur: ["PKR"],
};

function CurrencySelection() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const [more, setMore] = useState(false);
  const top = SUGGESTED[lang];
  const rest = currencies.filter(c => !top.includes(c));
  function choose(currency: Currency) {
    try { saveCurrency(currency); navigate({ to: "/setup" }); } catch { setFailed(true); }
  }
  const Row = ({ currency }: { currency: Currency }) => (
    <li>
      <button type="button" onClick={() => choose(currency)} className="flex min-h-16 w-full items-center gap-4 px-4 text-start transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">
        <span dir="ltr" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary">{currency}</span>
        <span dir="auto" className="flex-1 text-lg font-bold">{countryName(currency, lang)}</span>
        <ChevronRight aria-hidden className="size-5 text-muted-foreground rtl:rotate-180" />
      </button>
    </li>
  );
  return <>
    <AppHeader />
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary">{t("chooseCurrency")}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{t("approxRateNote")}</p>
      {failed && <p role="alert" className="mt-4 text-lg text-destructive">{t("saveError")}</p>}
      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {top.map(c => <Row key={c} currency={c} />)}
        {more && rest.map(c => <Row key={c} currency={c} />)}
      </ul>
      {!more && <button type="button" onClick={() => setMore(true)} className="mx-auto mt-4 flex min-h-12 items-center gap-2 rounded-full px-4 text-lg font-bold text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">
        <ChevronDown aria-hidden className="size-5" /><span dir="ltr">+{rest.length}</span>
      </button>}
    </div>
  </>;
}
