import adam from "@/data/adam.json";
import type { StringKey } from "@/i18n/translations";

export const billKeys = ["rent", "energy", "wifi", "phone", "other"] as const;
export type BillKey = (typeof billKeys)[number];
export type IncomeType = "weeklyGig" | "shiftWork" | "zeroHours" | "other";
export type Variation = "steady" | "variesBit" | "variesLot";
export type IncomeValue = number | null | "";
export type Profile = {
  firstName: string;
  incomeType: IncomeType | "";
  /** Weekly take-home in GBP: number = chosen range midpoint, null = "Not sure", "" = unanswered. */
  incomeLow: IncomeValue;
  incomeTypical: IncomeValue;
  incomeHigh: IncomeValue;
  variation: Variation | "";
  bills: Record<BillKey, { amount: string; day: string }>;
  monthlyTransport: string;
  weeklyFood: string;
  monthlyRemittance: string;
  currentBalance: string;
};
export type SavedProfile = { version: 1; source: "personal"; profile: Profile } | { version: 1; source: "adam"; data: typeof adam };
export const PROFILE_STORAGE_KEY = "futureyou.profile";
export const DRAFT_STORAGE_KEY = "futureyou.setupDraft";
export function emptyProfile(): Profile {
  return { firstName: "", incomeType: "", incomeLow: "", incomeTypical: "", incomeHigh: "", variation: "", bills: { rent: { amount: "", day: "" }, energy: { amount: "", day: "" }, wifi: { amount: "", day: "" }, phone: { amount: "", day: "" }, other: { amount: "", day: "" } }, monthlyTransport: "", weeklyFood: "", monthlyRemittance: "", currentBalance: "" };
}
function readStored(key: string): unknown {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem(key) ?? "null"); } catch { return null; }
}
export function loadProfile(): SavedProfile | null {
  const value = readStored(PROFILE_STORAGE_KEY) as SavedProfile | null;
  if (value?.version !== 1) return null;
  if (value.source === "personal") return { ...value, profile: { ...emptyProfile(), ...value.profile } };
  return value.source === "adam" ? value : null;
}
export function loadDraft(): { step: number; profile: Profile } | null {
  const value = readStored(DRAFT_STORAGE_KEY) as { step: number; profile: Profile } | null;
  return value?.profile?.bills && Number.isInteger(value.step) && value.step >= 0 && value.step < 7 ? { step: value.step, profile: { ...emptyProfile(), ...value.profile } } : null;
}
export function saveDraft(profile: Profile, step: number) {
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ profile, step }));
}
export function saveProfile(profile: Profile) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ version: 1, source: "personal", profile } satisfies SavedProfile));
  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}
export function useAdamProfile() {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ version: 1, source: "adam", data: adam } satisfies SavedProfile));
  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}
const isAmount = (value: string, optional = false) => (optional && value.trim() === "") || (value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0);
export function validateStep(profile: Profile, step: number): StringKey | null {
  if (step === 0) return profile.firstName.trim() ? null : "nameRequired";
  if (step === 1) {
    if (!profile.incomeType || !profile.variation) return "incomeRequired";
    if (profile.incomeLow === "" || profile.incomeTypical === "" || profile.incomeHigh === "") return "incomeRangeRequired";
    const income = resolveIncome(profile);
    if (!income) return "incomeAllUnsure";
    return income.low <= income.typical && income.typical <= income.high ? null : "incomeOrderError";
  }
  if (step === 2) {
    for (const key of billKeys) {
      const bill = profile.bills[key];
      if (!isAmount(bill.amount, true)) return "amountError";
      if ((Number(bill.amount) > 0 || bill.day !== "") && (!/^\d+$/.test(bill.day) || Number(bill.day) < 1 || Number(bill.day) > 31)) return "dayError";
    }
    return null;
  }
  if (step === 3) return isAmount(profile.monthlyTransport) ? null : "amountError";
  if (step === 4) return isAmount(profile.weeklyFood) ? null : "amountError";
  if (step === 5) return isAmount(profile.monthlyRemittance, true) ? null : "amountError";
  if (step === 6) return profile.currentBalance.trim() !== "" && Number.isFinite(Number(profile.currentBalance)) ? null : "balanceError";
  return null;
}
export function profileSummary(saved: SavedProfile) {
  if (saved.source === "personal") return { name: saved.profile.firstName, balance: Number(saved.profile.currentBalance), weeklyIncome: resolveIncome(saved.profile)?.typical ?? 0 };
  const incomes = saved.data.transactions.filter((transaction) => transaction.type === "income");
  return {
    name: saved.data.persona.name,
    balance: Math.round((saved.data.persona.startBalance + saved.data.transactions.filter((transaction) => transaction.date <= saved.data.persona.today).reduce((total, transaction) => total + transaction.amount, 0)) * 100) / 100,
    weeklyIncome: incomes.reduce((total, transaction) => total + transaction.amount, 0) / incomes.length,
  };
}
type Range = { id: string; min: number | null; max: number | null };
const ranges = (under: number, step: number, top: number): Range[] => {
  const list: Range[] = [{ id: `u${under}`, min: null, max: under }];
  for (let v = under; v < top; v += step) list.push({ id: `${v}`, min: v, max: v + step });
  list.push({ id: `o${top}`, min: top, max: null });
  return list;
};
export const incomeRanges = { incomeLow: ranges(100, 50, 300), incomeTypical: ranges(150, 50, 400), incomeHigh: ranges(250, 50, 500) };
/** Stored value for a range: midpoint; "Under £X" = X − 25; "£X or more" = X + 50. */
export function rangeValue(range: Range): number {
  if (range.min === null) return (range.max as number) - 25;
  if (range.max === null) return range.min + 50;
  return (range.min + range.max) / 2;
}
const round5 = (n: number) => Math.round(n / 5) * 5;
/** Fills "Not sure" values from the others. Returns null when nothing is known. */
export function resolveIncome(p: Pick<Profile, "incomeLow" | "incomeTypical" | "incomeHigh">) {
  const num = (v: IncomeValue) => (typeof v === "number" ? v : null);
  let low = num(p.incomeLow), typical = num(p.incomeTypical), high = num(p.incomeHigh);
  if (low === null && typical === null && high === null) return null;
  const estimated = { low: low === null, typical: typical === null, high: high === null };
  if (typical === null) typical = low !== null && high !== null ? round5((low + high) / 2) : low !== null ? round5(low * 1.5) : round5((high as number) * 0.65);
  if (low === null) low = high !== null && estimated.typical === false ? round5(Math.min(typical * 0.6, typical - (high - typical))) : round5(typical * 0.6);
  if (high === null) high = round5(typical * 1.5);
  low = Math.max(0, low);
  return { low, typical, high, estimated };
}
