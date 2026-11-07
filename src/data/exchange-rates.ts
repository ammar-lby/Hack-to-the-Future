import type { Currency } from "@/lib/currency";

/** Approximate units of each currency per £1. Hard-coded for the demo; not live rates. */
export const GBP_RATES: Record<Currency, number> = {
  GBP: 1,
  LYD: 6.9,
  PLN: 5.1,
  INR: 112,
  PKR: 375,
  BDT: 160,
  EGP: 64,
  NGN: 2050,
  PHP: 76,
  USD: 1.33,
  EUR: 1.17,
  AED: 4.9,
  SAR: 5,
  CAD: 1.83,
};

export function convertFromGbp(amount: number, currency: Currency): number {
  return amount * GBP_RATES[currency];
}
