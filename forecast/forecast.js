// Future You: 90-day "financial time travel" forecast.
// Plain JavaScript with no dependencies and no AI. Works in three places unchanged:
//   - the frontend (import { forecast } from "./forecast")
//   - an n8n Code node (paste the function, see forecast/README.md)
//   - Node, for testing: node forecast/test.js
//
// The AI never calculates anything. It only explains the numbers this returns.

function forecast(data, options = {}) {
  const days = options.days || 90;
  const buffer = options.buffer ?? 0; // balance below this counts as a risk
  const extra = options.extra || []; // [{ date, amount, name }] for "Can I afford it?"
  const billChanges = options.billChanges || {}; // { "Rent": 700 } for "simulate next week"

  const p = data.persona;
  const tx = data.transactions;
  const today = parseDate(p.today);

  // 1. Current balance = starting balance + everything that has happened since.
  const currentBalance = round(tx.reduce((sum, t) => sum + t.amount, p.startBalance));

  // 2. Income patterns: low, typical and high weeks.
  const pays = tx.filter((t) => t.type === "income").map((t) => t.amount).sort((a, b) => a - b);
  const income = {
    low: round(percentile(pays, 0.25)),
    typical: round(percentile(pays, 0.5)),
    high: round(percentile(pays, 0.75)),
    weeksOfHistory: pays.length,
  };
  const payWeekday = mostCommon(tx.filter((t) => t.type === "income").map((t) => parseDate(t.date).getUTCDay()));

  // 3. Everyday spending (food, transport, eating out) as a daily average.
  const historyDays = Math.max(1, daysBetween(parseDate(p.historyStart), today));
  const everyday = tx.filter((t) => t.type === "spend").reduce((s, t) => s - t.amount, 0);
  const dailySpend = round(everyday / historyDays);

  // 4. Walk forward day by day, twice: typical weeks and bad weeks.
  let expected = currentBalance;
  let badCase = currentBalance;
  const timeline = [];
  for (let i = 1; i <= days; i++) {
    const date = addDays(today, i);
    const iso = toIso(date);
    const events = [];

    expected -= dailySpend;
    badCase -= dailySpend;

    if (date.getUTCDay() === payWeekday) {
      expected += income.typical;
      badCase += income.low;
      events.push({ name: "Pay", amount: income.typical, lowAmount: income.low });
    }

    for (const bill of data.knownBills) {
      const due = bill.date ? bill.date === iso : bill.dayOfMonth === date.getUTCDate();
      if (due) {
        const amount = billChanges[bill.name] ?? bill.amount;
        expected -= amount;
        badCase -= amount;
        events.push({ name: bill.name, amount: -amount });
      }
    }

    for (const e of extra) {
      if (e.date === iso) {
        expected -= e.amount;
        badCase -= e.amount;
        events.push({ name: e.name || "Planned spend", amount: -e.amount });
      }
    }

    timeline.push({ date: iso, expected: round(expected), badCase: round(badCase), events });
  }

  // 5. Risk periods: weeks where the bad-weeks balance drops below the buffer.
  //    Risk weeks less than 4 weeks apart are merged into one period, because one
  //    big bill can leave a gap that lasts for several weeks.
  const byWeek = groupBy(timeline, (d) => toIso(startOfWeek(parseDate(d.date))));
  const riskWeeks = Object.entries(byWeek)
    .map(([week, list]) => ({ week, worst: list.reduce((a, b) => (b.badCase < a.badCase ? b : a)) }))
    .filter((w) => w.worst.badCase < buffer);

  const periods = [];
  for (const w of riskWeeks) {
    const last = periods.at(-1);
    if (last && daysBetween(parseDate(last.weeks.at(-1).week), parseDate(w.week)) <= 28) last.weeks.push(w);
    else periods.push({ weeks: [w] });
  }

  const risks = periods.map(({ weeks }) => {
    const first = weeks[0];
    const worst = weeks.reduce((a, b) => (b.worst.badCase < a.worst.badCase ? b : a)).worst;
    const shortfall = Math.ceil(buffer - worst.badCase);

    // What triggers it: the bills due in the first risk week, plus the 3 days before (rent on the 1st).
    const windowStart = addDays(parseDate(first.week), -3);
    const bills = timeline
      .filter((d) => parseDate(d.date) >= windowStart && parseDate(d.date) <= parseDate(first.worst.date))
      .flatMap((d) => d.events.filter((e) => e.amount < 0))
      .sort((a, b) => a.amount - b.amount); // biggest first
    const billNames = [...new Set(bills.map((b) => b.name))].slice(0, 2);

    // Saving has to be done before the first risk week, not the worst one.
    const weeksUntil = Math.max(1, Math.floor(daysBetween(today, parseDate(first.worst.date)) / 7));
    const perWeek = Math.ceil(shortfall / weeksUntil);

    return {
      week: first.week,
      firstDay: first.worst.date,
      lowestDay: worst.date,
      shortfall,
      expectedBalance: worst.expected,
      badCaseBalance: worst.badCase,
      bills: billNames,
      reason: billNames.length ? `${listText(billNames)} due in the same week` : "Several low-income weeks in a row",
      fix: `Save £${perWeek} a week for ${weeksUntil} weeks`,
      saveWeekly: perWeek,
      weeksUntil,
    };
  });

  return {
    persona: { name: p.name, language: p.language, homeCurrency: p.homeCurrency, gbpToHome: p.gbpToHome },
    today: p.today,
    currentBalance,
    currentBalanceHome: round(currentBalance * (p.gbpToHome || 1)),
    income,
    dailySpend,
    days: timeline,
    risks,
  };
}

// "Can I afford it?": re-run the forecast with one extra spend and compare.
function canIAfford(data, { date, amount, name }) {
  const before = forecast(data);
  const after = forecast(data, { extra: [{ date, amount, name }] });
  const gapBefore = worstGap(before);
  const gapAfter = worstGap(after);
  return {
    affordable: gapAfter === 0, // no week drops below the buffer, even in bad weeks
    gapBefore, // biggest shortfall without this spend
    gapAfter, // biggest shortfall with it
    makesGapBiggerBy: gapAfter - gapBefore,
    risksAfter: after.risks,
  };
}

// ---------- helpers ----------
function worstGap(f) { return f.risks.reduce((m, r) => Math.max(m, r.shortfall), 0); }
function parseDate(s) { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); }
function toIso(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; }
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
function startOfWeek(d) { const day = (d.getUTCDay() + 6) % 7; return addDays(d, -day); } // Monday
function round(n) { return Math.round(n * 100) / 100; }
function percentile(sorted, q) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
function mostCommon(arr) {
  const counts = {}; let best = arr[0];
  for (const v of arr) { counts[v] = (counts[v] || 0) + 1; if (counts[v] > counts[best]) best = v; }
  return best;
}
function groupBy(arr, keyFn) {
  return arr.reduce((acc, x) => { const k = keyFn(x); (acc[k] = acc[k] || []).push(x); return acc; }, {});
}
function listText(items) {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

if (typeof module !== "undefined") module.exports = { forecast, canIAfford };
