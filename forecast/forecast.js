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
  const payChanges = options.payChanges || {}; // { "2026-11-09": 180 } overrides one payday (both lines)

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
      const changed = payChanges[iso];
      const pay = changed ?? income.typical;
      const lowPay = changed ?? income.low;
      expected += pay;
      badCase += lowPay;
      events.push({ name: "Pay", amount: pay, lowAmount: lowPay, ...(changed != null ? { changed: true } : {}) });
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

    // "Why am I seeing this?": everything the warning is based on, so the user can check it.
    const why = {
      payRange: { low: income.low, typical: income.typical, high: income.high, weeksOfHistory: income.weeksOfHistory },
      billsThatWeek: timeline
        .filter((d) => parseDate(d.date) >= windowStart && parseDate(d.date) <= addDays(parseDate(first.week), 6))
        .flatMap((d) => d.events.filter((e) => e.amount < 0).map((e) => ({ name: e.name, amount: -e.amount, date: d.date }))),
      everydaySpendPerWeek: round(dailySpend * 7),
      lowestExpected: worst.expected,
      lowestBadCase: worst.badCase,
      explanation: `In a slow week you earn about £${Math.round(income.low)}. ${billNames.length ? listText(billNames) + " land close together, " : ""}so your balance could drop ${worst.badCase < 0 ? `£${Math.round(-worst.badCase)} below zero` : `to £${Math.round(worst.badCase)}`}.`,
    };

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
      why,
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

// "Simulate next week" (proactive alert demo): the landlord puts rent up and next week is slow.
// Re-runs the forecast and reports what changed, so the app can show a new Future You alert.
function simulateNextWeek(data, change = {}) {
  const rentName = change.billName || "Rent";
  const rentBill = data.knownBills.find((b) => b.name === rentName);
  const newRent = change.newAmount ?? (rentBill ? rentBill.amount + 50 : 0);
  const before = forecast(data);

  // The next payday after "today", paid at the slow-week level or the amount given.
  const today = parseDate(data.persona.today);
  const payWeekday = mostCommon(data.transactions.filter((t) => t.type === "income").map((t) => parseDate(t.date).getUTCDay()));
  let nextPay = addDays(today, 1);
  while (nextPay.getUTCDay() !== payWeekday) nextPay = addDays(nextPay, 1);
  const slowPay = change.nextPay ?? Math.round(before.income.low * 0.75);

  const options = { billChanges: { [rentName]: newRent }, payChanges: { [toIso(nextPay)]: slowPay } };
  const after = forecast(data, options);
  const gapBefore = worstGap(before);
  const gapAfter = worstGap(after);

  return {
    options, // post these back to /forecast (or /coach, /future-message) to use the new situation
    changes: [
      `${rentName} goes up from £${rentBill ? rentBill.amount : 0} to £${newRent}`,
      `Pay on ${toIso(nextPay)} is £${slowPay} instead of about £${Math.round(before.income.typical)}`,
    ],
    gapBefore,
    gapAfter,
    gapGrewBy: gapAfter - gapBefore,
    alert: gapAfter > gapBefore,
    risk: after.risks[0] || null,
    forecast: after,
  };
}

// Buffer pot: keep saving after the risk is covered and build an emergency fund.
function bufferPot(data, { perWeek, target = 500 } = {}) {
  const f = forecast(data);
  const risk = f.risks[0];
  const weekly = perWeek ?? (risk ? risk.saveWeekly : 10);
  const weeksToTarget = Math.ceil(target / weekly);
  const today = parseDate(f.today);
  const milestones = [];
  for (const amount of [100, 250, target]) {
    if (amount > target) continue;
    const weeks = Math.ceil(amount / weekly);
    milestones.push({ amount, weeks, date: toIso(addDays(today, weeks * 7)) });
  }
  return {
    perWeek: weekly,
    target,
    weeksToTarget,
    targetDate: toIso(addDays(today, weeksToTarget * 7)),
    coversRisk: risk ? { shortfall: risk.shortfall, coveredAfterWeeks: Math.ceil(risk.shortfall / weekly) } : null,
    milestones: [...new Map(milestones.map((m) => [m.amount, m])).values()],
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

if (typeof module !== "undefined") module.exports = { forecast, canIAfford, simulateNextWeek, bufferPot };
