import { beforeEach, describe, expect, it } from "vitest";
import { convertFromGbp } from "@/data/exchange-rates";
import { loadMoneyMode, saveMoneyMode } from "@/lib/money-mode";

describe("money display", () => {
  beforeEach(() => localStorage.clear());
  it("converts pounds with the fixed LYD rate", () => { expect(convertFromGbp(100, "LYD")).toBe(690); });
  it("remembers the chosen display mode, defaulting to GBP", () => {
    expect(loadMoneyMode()).toBe("gbp");
    saveMoneyMode("both");
    expect(loadMoneyMode()).toBe("both");
  });
});
