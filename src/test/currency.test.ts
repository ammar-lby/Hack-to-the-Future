import { beforeEach, describe, expect, it } from "vitest";
import { currencies, loadCurrency, saveCurrency, type Currency } from "@/lib/currency";
import { saveLanguage } from "@/lib/i18n";

describe("home currency", () => {
  beforeEach(() => localStorage.clear());
  it.each(["INR", "PKR", "BDT", "EGP", "NGN", "PHP", "USD", "EUR"] as Currency[])("offers and remembers %s", (currency) => {
    expect(currencies).toContain(currency);
    saveCurrency(currency);
    expect(loadCurrency()).toBe(currency);
  });
  it("keeps the currency when switching language", () => {
    saveCurrency("PKR");
    saveLanguage("ur");
    saveLanguage("ar");
    expect(loadCurrency()).toBe("PKR");
  });
});