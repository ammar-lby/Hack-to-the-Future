import { beforeEach, describe, expect, it } from "vitest";
import { dirFor, loadLanguage, saveLanguage } from "@/lib/i18n";
import { translate, type Lang } from "@/i18n/translations";

describe("language choice", () => {
  beforeEach(() => localStorage.clear());

  it("remembers the chosen language in the browser", () => {
    saveLanguage("ar");
    expect(loadLanguage()).toBe("ar");
  });

  it("uses right-to-left layout for Arabic and left-to-right for English", () => {
    expect(dirFor("ar")).toBe("rtl");
    expect(dirFor("en")).toBe("ltr");
  });

  it.each(["en", "ar", "hi", "bn", "ur"] as Lang[])("remembers %s independently of its translation availability", (lang) => {
    saveLanguage(lang);
    expect(loadLanguage()).toBe(lang);
  });

  it("uses RTL for Urdu and LTR for Hindi and Bengali", () => {
    expect(dirFor("ur")).toBe("rtl");
    expect(dirFor("hi")).toBe("ltr");
    expect(dirFor("bn")).toBe("ltr");
  });

  it.each(["hi", "bn", "ur"] as Lang[])("falls back to English translations for %s", (lang) => {
    expect(translate(lang, "chooseCurrency")).toBe(translate("en", "chooseCurrency"));
    expect(translate(lang, "setupTitle")).toBe(translate("en", "setupTitle"));
  });
});
