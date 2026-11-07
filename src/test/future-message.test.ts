import { beforeEach, describe, expect, it } from "vitest";
import { buildOutlook } from "@/lib/outlook-data";
import { futureMessagePayload, saveRiskAction, hasRiskAction, saveCoachRisk } from "@/lib/future-message";

beforeEach(() => localStorage.clear());
describe("future message contract and actions", () => {
  it("sends the exact requested field names and unmodified forecast numbers", () => {
    const data = buildOutlook(null), risk = data.risks[0];
    if (!risk) throw new Error("Expected demo risk");
    expect(futureMessagePayload(risk, "ar", data.persona)).toEqual({ risk: { week: "2027-01-04", shortfall: 127, reason: "Car insurance (annual) and Rent due in the same week", fix: "Save £16 a week for 8 weeks" }, language: "ar", persona: { name: "Adam", language: "ar", homeCurrency: "LYD" } });
  });
  it("saves the set-aside amount from the risk fix, without moving money", () => {
    const risk = buildOutlook(null).risks[0];
    if (!risk) throw new Error("Expected demo risk");
    saveRiskAction(risk, "setAside");
    expect(JSON.parse(localStorage.getItem("futureyou.riskAction.2027-01-04.setAside") ?? "null")).toEqual({ week: "2027-01-04", action: "setAside", amount: 16, weeks: 8 });
    expect(hasRiskAction(risk, "setAside")).toBe(true);
    expect(localStorage.getItem("futureyou.profile")).toBeNull();
  });
  it("persists an insurance reminder", () => {
    const risk = buildOutlook(null).risks[0];
    if (!risk) throw new Error("Expected demo risk");
    saveRiskAction(risk, "insuranceReminder");
    expect(hasRiskAction(risk, "insuranceReminder")).toBe(true);
  });
  it("passes the next forecast risk to the coach unchanged", () => {
    const risk = buildOutlook(null).risks[0];
    if (!risk) throw new Error("Expected demo risk");
    saveCoachRisk(risk);
    expect(JSON.parse(localStorage.getItem("futureyou.coachRisk") ?? "null")).toEqual(risk);
  });
});