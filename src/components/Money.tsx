import { convertFromGbp } from "@/data/exchange-rates";
import { useLanguage } from "@/lib/i18n";
import { saveMoneyMode, useMoneyMode, type MoneyMode } from "@/lib/money-mode";
import { cn } from "@/lib/utils";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2, minimumFractionDigits: 0 });
const whole = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const formatHome = (amount: number, code: string) => `≈ ${code} ${whole.format(amount)}`;

/**
 * Displays a GBP amount following the saved display mode (GBP, home currency, or both).
 * Use for every money amount in the app.
 */
export function Money({ amount, className }: { amount: number; className?: string }) {
  const { mode, home } = useMoneyMode();
  const pounds = <bdi dir="ltr">{gbp.format(amount)}</bdi>;
  if (!home || mode === "gbp") return <span className={className}>{pounds}</span>;
  const converted = <bdi dir="ltr">{formatHome(convertFromGbp(amount, home), home)}</bdi>;
  if (mode === "home") return <span className={className}>{converted}</span>;
  return (
    <span className={cn("inline-flex flex-col align-middle leading-tight", className)}>
      {pounds}
      <span className="text-[0.6em] font-semibold opacity-80">{converted}</span>
    </span>
  );
}

export function MoneyModeToggle() {
  const { t } = useLanguage();
  const { mode, home } = useMoneyMode();
  if (!home) return null;
  const options: { value: MoneyMode; label: string }[] = [
    { value: "gbp", label: "£ GBP" },
    { value: "home", label: home },
    { value: "both", label: t("bothCurrencies") },
  ];
  return (
    <div>
      <div role="radiogroup" aria-label={t("showAmountsIn")} className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1">
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={mode === o.value} onClick={() => saveMoneyMode(o.value)}
            className={cn("min-h-12 rounded-xl px-2 text-lg font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring", mode === o.value ? "bg-secondary text-secondary-foreground" : "text-secondary")}>
            <bdi>{o.label}</bdi>
          </button>
        ))}
      </div>
      {mode !== "gbp" && <p className="mt-2 text-base text-muted-foreground">{t("approxRateNote")}</p>}
    </div>
  );
}
