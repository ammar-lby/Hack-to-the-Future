import { MOCK_VARIATION, WEEKS_PER_MONTH } from "@/data/mock-month";
import { billKeys, resolveIncome, type SavedProfile } from "@/lib/profile";
import type { StringKey } from "@/i18n/translations";
import { loadDemoState, simulatedForecast } from "@/lib/simulate";

export const categoryKeys = ["catRent", "catFood", "catTransport", "catBills", "catHome"] as const;
export type CategoryKey = (typeof categoryKeys)[number];
export type Dashboard = {
  name: string;
  balance: number;
  income: number;
  spending: number;
  categories: { key: CategoryKey; amount: number }[];
  estimated: boolean;
};

const round = (n: number) => Math.round(n * 100) / 100;
const num = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Maps the demo persona's transaction categories to dashboard categories. */
const personaCategory: Record<string, CategoryKey> = {
  Rent: "catRent", Groceries: "catFood", "Eating out": "catFood", Transport: "catTransport", "Money sent home": "catHome",
};

function finish(name: string, balance: number, income: number, totals: Record<CategoryKey, number>, estimated: boolean): Dashboard {
  const categories = categoryKeys.map((key) => ({ key, amount: round(totals[key]) }));
  return { name, balance: round(balance), income: round(income), spending: round(categories.reduce((t, c) => t + c.amount, 0)), categories, estimated };
}

export function buildDashboard(saved: SavedProfile): Dashboard {
  const totals: Record<CategoryKey, number> = { catRent: 0, catFood: 0, catTransport: 0, catBills: 0, catHome: 0 };
  if (saved.source === "adam") {
    const state = loadDemoState();
    if (state.weeks > 0) {
      const f = simulatedForecast(saved.data);
      for (const day of f.days.slice(0, 30)) {
        for (const event of day.events) {
          if (event.amount < 0) totals[personaCategory[event.name] ?? "catBills"] += -event.amount;
        }
      }
      return finish(f.persona.name, f.currentBalance, f.days.slice(0, 30).flatMap(day => day.events).filter(event => event.amount > 0).reduce((sum, event) => sum + event.amount, 0), totals, true);
    }
    const { persona, transactions } = saved.data;
    const month = persona.today.slice(0, 7);
    let income = 0;
    for (const tx of transactions) {
      if (tx.date > persona.today) continue;
      if (!tx.date.startsWith(month)) continue;
      if (tx.amount > 0) income += tx.amount;
      else totals[personaCategory[tx.category] ?? "catBills"] += -tx.amount;
    }
    const balance = persona.startBalance + transactions.filter((tx) => tx.date <= persona.today).reduce((t, tx) => t + tx.amount, 0);
    return finish(persona.name, balance, income, totals, false);
  }
  const p = saved.profile;
  const typical = resolveIncome(p)?.typical ?? 0;
  totals.catRent = num(p.bills.rent.amount);
  totals.catBills = billKeys.filter((k) => k !== "rent").reduce((t, k) => t + num(p.bills[k].amount), 0);
  totals.catFood = num(p.weeklyFood) * WEEKS_PER_MONTH * MOCK_VARIATION.food;
  totals.catTransport = num(p.monthlyTransport) * MOCK_VARIATION.transport;
  totals.catHome = num(p.monthlyRemittance);
  return finish(p.firstName, num(p.currentBalance), typical * WEEKS_PER_MONTH * MOCK_VARIATION.income, totals, true);
}

export const categoryLabel: Record<CategoryKey, StringKey> = { catRent: "catRent", catFood: "catFood", catTransport: "catTransport", catBills: "catBills", catHome: "catHome" };
