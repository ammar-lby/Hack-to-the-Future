import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { currencies, saveCurrency, type Currency } from "@/lib/currency";

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

function CurrencySelection() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  function choose(currency: Currency) {
    try { saveCurrency(currency); navigate({ to: "/setup" }); } catch { setFailed(true); }
  }
  return <>
    <AppHeader />
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-secondary">{t("chooseCurrency")}</h1>
      {failed && <p role="alert" className="mb-4 text-lg text-destructive">{t("saveError")}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {currencies.map((currency) => <Button key={currency} variant="outline" dir="ltr" onClick={() => choose(currency)} className="h-auto min-h-20 rounded-2xl text-2xl font-bold focus-visible:ring-4">{currency}</Button>)}
      </div>
    </div>
  </>;
}