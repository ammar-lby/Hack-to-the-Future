import { beforeEach, describe, expect, it } from "vitest";
import adam from "@/data/adam.json";
import { demoDate, loadDemoState, resetDemo, simulateNextWeek, simulatedForecast } from "@/lib/simulate";
beforeEach(() => localStorage.clear());
describe("demo simulation", () => {
  it("moves forward exactly 7 days and makes an earlier risk appear", () => {
    const before = simulatedForecast(adam);
    const after = simulateNextWeek(adam);
    expect(after.today).toBe("2026-11-22");
    expect(after.risks[0]?.week).toBe("2026-11-30");
    expect(before.risks[0]?.week).toBe("2027-01-04");
    expect(after.risks[0]?.shortfall).toBeGreaterThan(before.risks[0]?.shortfall ?? 0);
    expect(loadDemoState().changed).toBe(true);
  });
  it("keeps state in storage and reset restores the starting forecast", () => {
    const before = simulatedForecast(adam);
    simulateNextWeek(adam);
    expect(demoDate(loadDemoState())).toBe("2026-11-22");
    resetDemo();
    expect(simulatedForecast(adam)).toEqual(before);
    expect(adam.persona.today).toBe("2026-11-07");
  });
});