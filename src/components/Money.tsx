import { convertFromGbp } from "@/data/exchange-rates";
import { useLanguage } from "@/lib/i18n";
import { saveMoneyMode, useMoneyMode, type MoneyMode } from "@/lib/money-mode";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useState } from "react";
import { cn } from "@/lib/utils";

const gbp0 = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const gbp2 = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 });
// Whole pounds stay whole (£600); anything with pence always shows two digits (£1,056.60).
const gbp = { format: (n: number) => (Number.isInteger(Math.round(n * 100) / 100) ? gbp0 : gbp2).format(n) };
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
      <span className="text-[0.75em] font-semibold">{converted}</span>
    </span>
  );
}

export function MoneyModeToggle() {
  const { t } = useLanguage();
  const { mode, home } = useMoneyMode();
  const [failed, setFailed] = useState(false);
  if (!home) return null;
  const options: { value: MoneyMode; label: string }[] = [
    { value: "gbp", label: "£ GBP" },
    { value: "home", label: home },
    { value: "both", label: t("bothCurrencies") },
  ];
  return (
    <div>
      <RadioGroup value={mode} onValueChange={value => { try { saveMoneyMode(value as MoneyMode); setFailed(false); } catch { setFailed(true); } }} aria-label={t("showAmountsIn")} className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1">
        {options.map((o) => (
          <RadioGroupPrimitive.Item asChild key={o.value} value={o.value}><Button variant="ghost"
            className={cn("min-h-12 rounded-xl px-2 text-lg font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring", mode === o.value ? "bg-secondary text-secondary-foreground" : "text-secondary")}>
            <bdi>{o.label}</bdi>
          </Button></RadioGroupPrimitive.Item>
        ))}
      </RadioGroup>
      {failed && <p role="alert" className="mt-2 text-lg text-destructive">{t("saveError")}</p>}
      {mode !== "gbp" && <p className="mt-2 text-base text-muted-foreground">{t("approxRateNote")}</p>}
    </div>
  );
}
