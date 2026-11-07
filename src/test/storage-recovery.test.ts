import { afterEach, describe, expect, it, vi } from "vitest";
import { loadLanguage } from "@/lib/i18n";
import { loadCurrency } from "@/lib/currency";
import { loadMoneyMode } from "@/lib/money-mode";

describe("blocked browser storage recovery", () => {
  afterEach(() => vi.restoreAllMocks());
  it("keeps the app readable when saved preferences cannot be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    expect(loadLanguage()).toBeNull();
    expect(loadCurrency()).toBeNull();
    expect(loadMoneyMode()).toBe("gbp");
  });
});