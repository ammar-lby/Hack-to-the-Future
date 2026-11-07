import { useSyncExternalStore } from "react";
import { DEMO_TODAY } from "@/config";
import { forecast, type ForecastInput } from "@/lib/forecast";

export const DEMO_STATE_KEY = "futureyou.demoState";
export type DemoState = { version: 1; weeks: number; rentIncrease: number; changed: boolean };
const initial: DemoState = { version: 1, weeks: 0, rentIncrease: 0, changed: false };
const listeners = new Set<() => void>();
let revision = 0;
export function loadDemoState(): DemoState {
  if (typeof window === "undefined") return initial;
  try {
    const value = JSON.parse(window.localStorage.getItem(DEMO_STATE_KEY) ?? "null");
    return value?.version === 1 && Number.isInteger(value.weeks) && value.weeks >= 0 && Number.isFinite(value.rentIncrease) && value.rentIncrease >= 0 ? value : initial;
  } catch { return initial; }
}
function notify() { revision++; listeners.forEach(listener => listener()); }
export function useDemoRevision() {
  return useSyncExternalStore(listener => { listeners.add(listener); window.addEventListener("storage", listener); return () => { listeners.delete(listener); window.removeEventListener("storage", listener); }; }, () => revision, () => 0);
}
export function demoDate(state: DemoState) {
  const date = new Date(`${DEMO_TODAY}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + state.weeks * 7);
  return date.toISOString().slice(0, 10);
}
/** Demo-only input changes; all balance and risk arithmetic remains in forecast. */
export function simulatedForecast(source: ForecastInput, state = loadDemoState()) {
  const rent = source.knownBills.find(bill => bill.name === "Rent");
  return forecast({ ...source, persona: { ...source.persona, today: demoDate(state) } }, { billChanges: rent && state.weeks ? { Rent: rent.amount + state.rentIncrease } : {} });
}
export function simulateNextWeek(source: ForecastInput) {
  const previous = loadDemoState();
  const state: DemoState = { version: 1, weeks: previous.weeks + 1, rentIncrease: previous.rentIncrease + 400, changed: true };
  const result = simulatedForecast(source, state);
  window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
  notify();
  return result;
}
export function resetDemo() { window.localStorage.removeItem(DEMO_STATE_KEY); notify(); }