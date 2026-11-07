export const currencies = ["INR", "PKR", "BDT", "EGP", "NGN", "PHP", "LYD", "PLN", "USD", "EUR", "GBP", "AED", "SAR", "CAD"] as const;
export type Currency = (typeof currencies)[number];
export const CURRENCY_STORAGE_KEY = "futureyou.currency";

export function saveCurrency(currency: Currency) {
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}

export function loadCurrency(): Currency | null {
  if (typeof window === "undefined") return null;
  try { const value = window.localStorage.getItem(CURRENCY_STORAGE_KEY); return currencies.find((currency) => currency === value) ?? null; } catch { return null; }
}