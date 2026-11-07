import { beforeEach, describe, expect, it } from "vitest";
import adam from "@/data/adam.json";
import { emptyProfile, loadDraft, loadProfile, profileSummary, saveDraft, saveProfile, useAdamProfile, validateStep, rangeValue, incomeRanges, resolveIncome } from "@/lib/profile";

describe("profile setup", () => {
  beforeEach(() => localStorage.clear());
  it("requires a first name", () => {
    expect(validateStep(emptyProfile(), 0)).toBe("nameRequired");
    expect(validateStep({ ...emptyProfile(), firstName: "Nulara" }, 0)).toBeNull();
  });
  it("requires income type, weekly amount and variation", () => {
    const profile = emptyProfile();
    expect(validateStep(profile, 1)).toBe("incomeRequired");
    profile.incomeType = "zeroHours";
    profile.variation = "variesLot";
    expect(validateStep(profile, 1)).toBe("incomeRangeRequired");
    Object.assign(profile, { incomeLow: 125, incomeTypical: 275, incomeHigh: 375 });
    expect(validateStep(profile, 1)).toBeNull();
  });
  it("stores range midpoints with Under X = X-25 and X or more = X+50", () => {
    expect(rangeValue(incomeRanges.incomeLow[0]!)).toBe(75);
    expect(rangeValue(incomeRanges.incomeLow.at(-1)!)).toBe(350);
    expect(rangeValue(incomeRanges.incomeTypical[1]!)).toBe(175);
  });
  it("blocks low above typical or typical above good", () => {
    const p = { ...emptyProfile(), incomeType: "other" as const, variation: "steady" as const, incomeLow: 275, incomeTypical: 175, incomeHigh: 475 };
    expect(validateStep(p, 1)).toBe("incomeOrderError");
    expect(validateStep({ ...p, incomeLow: 125, incomeHigh: 125 }, 1)).toBe("incomeOrderError");
  });
  it("estimates a Not sure typical week as the midpoint of low and good", () => {
    const r = resolveIncome({ incomeLow: 125, incomeTypical: null, incomeHigh: 375 });
    expect(r?.typical).toBe(250);
    expect(r?.estimated.typical).toBe(true);
    expect(validateStep({ ...emptyProfile(), incomeType: "other", variation: "steady", incomeLow: null, incomeTypical: null, incomeHigh: null }, 1)).toBe("incomeAllUnsure");
  });
  it("accepts monthly bill due days only from 1 to 31", () => {
    const profile = emptyProfile();
    profile.bills.rent = { amount: "600", day: "32" };
    expect(validateStep(profile, 2)).toBe("dayError");
    profile.bills.rent.day = "1";
    expect(validateStep(profile, 2)).toBeNull();
    profile.bills.rent.day = "0";
    expect(validateStep(profile, 2)).toBe("dayError");
    profile.bills.rent.day = "31";
    expect(validateStep(profile, 2)).toBeNull();
  });
  it("allows money sent home to be omitted", () => {
    expect(validateStep(emptyProfile(), 5)).toBeNull();
  });
  it("allows a negative current balance but not a blank balance", () => {
    expect(validateStep(emptyProfile(), 6)).toBe("balanceError");
    expect(validateStep({ ...emptyProfile(), currentBalance: "-25.50" }, 6)).toBeNull();
  });
  it("restores draft answers and the current step", () => {
    const profile = { ...emptyProfile(), firstName: "Nulara", incomeTypical: 275 };
    saveDraft(profile, 3);
    expect(loadDraft()).toEqual({ profile, step: 3 });
  });
  it("saves every profile field without changing the home currency", () => {
    localStorage.setItem("futureyou.currency", "INR");
    const profile = { ...emptyProfile(), firstName: "Nulara", incomeType: "shiftWork" as const, variation: "variesBit" as const, incomeLow: 125, incomeTypical: null, incomeHigh: 375, monthlyTransport: "80", weeklyFood: "45", monthlyRemittance: "100", currentBalance: "123.45" };
    profile.bills.rent = { amount: "600", day: "1" };
    saveProfile(profile);
    expect(loadProfile()).toEqual({ version: 1, source: "personal", profile });
    expect(localStorage.getItem("futureyou.currency")).toBe("INR");
    expect(loadDraft()).toBeNull();
  });
  it("loads the exact imported Adam persona and transactions and skips any draft", () => {
    saveDraft(emptyProfile(), 0);
    useAdamProfile();
    const saved = loadProfile();
    expect(saved).toEqual({ version: 1, source: "adam", data: adam });
    expect(loadDraft()).toBeNull();
    if (!saved) throw new Error("Missing demo profile");
    expect(profileSummary(saved).name).toBe("Adam");
    expect(profileSummary(saved).balance).toBe(554.21);
  });
});