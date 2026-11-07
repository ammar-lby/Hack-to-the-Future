import adam from "@/data/adam.json";
import { forecast, type ForecastInput } from "@/lib/forecast";
import { simulatedForecast } from "@/lib/simulate";
import type { SavedProfile } from "@/lib/profile";

export type OutlookData = ReturnType<typeof forecast>;

/** Never fabricate transaction history. Personal profiles without history show a labelled Adam preview. */
export function buildOutlook(saved: SavedProfile | null) {
  const source: ForecastInput = saved?.source === "adam" ? saved.data : adam;
  return simulatedForecast(source);
}

export function weekOf(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}

export function riskWeeks(data: OutlookData) {
  return [...new Set(data.days.filter(day => day.badCase < 0).map(day => weekOf(day.date)))];
}