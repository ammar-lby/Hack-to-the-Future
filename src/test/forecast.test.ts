import { describe, expect, it } from "vitest";
import adam from "@/data/adam.json";
import { DEMO_TODAY } from "@/config";
import { forecast } from "@/lib/forecast";
import { buildOutlook, riskWeeks } from "@/lib/outlook-data";

describe("90-day forecast", () => {
  it("uses the fixed demo date without changing the saved persona", () => {
    const saved = { version: 1 as const, source: "adam" as const, data: adam };
    const before = JSON.stringify(saved);
    const result = buildOutlook(saved);
    expect(result.today).toBe(DEMO_TODAY);
    expect(DEMO_TODAY).toBe("2026-11-15");
    expect(JSON.stringify(saved)).toBe(before);
    expect(adam.persona.today).toBe("2026-11-07");
  });

  it("returns exactly 90 daily balances including February bills", () => {
    const result = buildOutlook(null);
    expect(result.days).toHaveLength(90);
    expect(result.days[0]?.date).toBe("2026-11-16");
    expect(result.days[89]?.date).toBe("2027-02-13");
    expect(result.days.find(d => d.date === "2027-02-01")?.events).toContainEqual({ name: "Rent", amount: -600 });
    expect(result.days.find(d => d.date === "2027-02-08")?.events).toContainEqual({ name: "Phone", amount: -15 });
    expect(result.days.find(d => d.date === "2027-01-04")?.events).toContainEqual({ name: "Car insurance (annual)", amount: -690 });
  });

  it("uses only engine results for the risk and saving suggestion", () => {
    const result = buildOutlook(null);
    expect(result.currentBalance).toBe(554.21);
    expect(result.risks).toHaveLength(1);
    expect(result.risks[0]).toMatchObject({ week: "2027-01-04", lowestDay: "2027-02-07", shortfall: 127, badCaseBalance: -126.51, expectedBalance: 308.49, bills: ["Car insurance (annual)", "Rent"], saveWeekly: 16, weeksUntil: 8, fix: "Save £16 a week for 8 weeks" });
  });

  it("marks all negative-balance weeks, including after the first risk week", () => {
    const weeks = riskWeeks(buildOutlook(null));
    expect(weeks).toContain("2027-01-04");
    expect(weeks).toContain("2027-02-01");
    expect(weeks).not.toContain("2026-11-16");
  });

  it("includes bills on day 90 and excludes bills on day 91", () => {
    const result = forecast({ ...adam, persona: { ...adam.persona, today: DEMO_TODAY }, knownBills: [{ name: "Final day", amount: 10, date: "2027-02-13" }, { name: "Outside", amount: 20, date: "2027-02-14" }] });
    expect(result.days[89]?.events).toContainEqual({ name: "Final day", amount: -10 });
    expect(result.days.flatMap(day => day.events).some(event => event.name === "Outside")).toBe(false);
  });
});