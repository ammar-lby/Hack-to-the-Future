import { describe, expect, it } from "vitest";
import { canIAfford } from "@/lib/forecast";
import { buildOutlook, outlookInput } from "@/lib/outlook-data";

describe("Can I afford it? and the emergency pot", () => {
  it("sending £150 home this week makes the January gap £150 bigger", () => {
    const input = outlookInput(null);
    const r = canIAfford(input, { date: "2026-11-08", amount: 150 });
    expect(r.gapBefore).toBe(143);
    expect(r.gapAfter).toBe(293);
    expect(r.affordable).toBe(false);
  });
  it("£16 a week reaches a £500 pot in 32 weeks", () => {
    const risk = buildOutlook(null).risks[0]!;
    expect(Math.ceil(500 / risk.saveWeekly)).toBe(32);
    expect(Math.ceil(risk.shortfall / risk.saveWeekly)).toBeLessThanOrEqual(risk.weeksUntil);
  });
});
