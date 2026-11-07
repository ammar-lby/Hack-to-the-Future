import { describe, expect, it } from "vitest";
import adam from "@/data/adam.json";
import { buildDashboard } from "@/lib/dashboard-data";

describe("dashboard data", () => {
  it("uses Adam's transactions for the current month and his balance", () => {
    const d = buildDashboard({ version: 1, source: "adam", data: adam });
    expect(d.balance).toBe(554.21);
    expect(d.categories.find((c) => c.key === "catRent")?.amount).toBe(600);
    expect(d.estimated).toBe(false);
  });
});
