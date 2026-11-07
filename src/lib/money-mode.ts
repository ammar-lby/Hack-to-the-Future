import { useSyncExternalStore } from "react";
import { loadCurrency, type Currency } from "@/lib/currency";

export type MoneyMode = "gbp" | "home" | "both";
export const MONEY_MODE_STORAGE_KEY = "futureyou.moneyMode";
const EVENT = "futureyou:moneymode";

export function loadMoneyMode(): MoneyMode {
  if (typeof window === "undefined") return "gbp";
  try { const value = window.localStorage.getItem(MONEY_MODE_STORAGE_KEY); return value === "home" || value === "both" ? value : "gbp"; } catch { return "gbp"; }
}
export function saveMoneyMode(mode: MoneyMode) {
  window.localStorage.setItem(MONEY_MODE_STORAGE_KEY, mode);
  window.dispatchEvent(new Event(EVENT));
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
}
/** Home currency other than GBP, or null when there is nothing to convert to. */
export function homeCurrencyForDisplay(): Currency | null {
  const c = loadCurrency();
  return c && c !== "GBP" ? c : null;
}
export function useMoneyMode(): { mode: MoneyMode; home: Currency | null } {
  const mode = useSyncExternalStore(subscribe, loadMoneyMode, () => "gbp" as MoneyMode);
  const home = useSyncExternalStore(subscribe, homeCurrencyForDisplay, () => null);
  return { mode: home ? mode : "gbp", home };
}
