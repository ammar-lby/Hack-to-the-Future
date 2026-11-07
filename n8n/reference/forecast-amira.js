// Future You — deterministic 90-day cash-flow forecast (no LLM, no randomness).
// Local:  node forecast.js persona_amira.json            -> baseline
//         node forecast.js persona_amira.json fix        -> with the coach's two fixes applied
// n8n Code node: paste everything above the "CLI" block, then:
//   const persona = $input.first().json.persona; const opts = $input.first().json.scenario || {};
//   return [{ json: forecast(persona, opts) }];
// The LLM never computes numbers: it only explains this output.

const HORIZON_DAYS = 90;
const SHORTFALL_BELOW = 0;   // balance under £0 = shortfall (high)
const WATCH_BELOW = 50;      // balance under £50 = thin cushion (watch)
const BAD_WEEK_FACTOR = 0.85; // "one bad week": that week's income 15% lower

const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };
const iso = d => d.toISOString().slice(0, 10);
const round = n => Math.round(n);
const median = a => { const s = [...a].sort((x, y) => x - y), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// Weekly income = 50% median of last 8 weeks + 50% same week last year.
// This is the "financial time travel": last year's pattern says January is quiet.
function projectWeeklyIncome(history, w) {
  return 0.5 * median(history.slice(-8)) + 0.5 * history[w % history.length];
}

function nextDate(start, month, day) {
  let y = start.getUTCFullYear(), d = new Date(Date.UTC(y, month - 1, day));
  if (d < start) d = new Date(Date.UTC(y + 1, month - 1, day));
  return d;
}

function billsOnDay(recurring, d, opts) {
  const day = d.getUTCDate(), month = d.getUTCMonth() + 1, out = [];
  for (const r of recurring) {
    const spread = opts.spread_yearly && opts.spread_yearly.includes(r.id) && r.cadence === 'yearly';
    // Instalments start at the next renewal date (you can switch to monthly when the policy renews).
    if (spread && day === r.day && d >= nextDate(opts._start, r.month, r.day)) out.push({ ...r, label: r.label.replace(' (yearly)', '') + ' (monthly instalment)', amount: round(r.amount * (opts.spread_markup || 1.08) / 12) });
    else if (!spread && r.cadence === 'monthly' && r.day === day && (!r.months || r.months.includes(month))) out.push(r);
    else if (!spread && r.cadence === 'yearly' && r.month === month && r.day === day) out.push(r);
  }
  return out;
}

function forecast(persona, opts = {}) {
  const start = new Date(persona.as_of + 'T00:00:00Z');
  opts = { ...opts, _start: start };
  const hist = persona.income.history_weekly;
  const usual = median(hist.slice(-8));
  const setAside = opts.set_aside_per_good_week || 0; // spend this much less in weeks above usual income
  let bal = persona.opening_balance, setAsideTotal = 0;
  const days = [], weeks = [];
  let week;

  for (let i = 0; i < HORIZON_DAYS; i++) {
    const d = addDays(start, i), w = Math.floor(i / 7);
    if (i % 7 === 0) {
      const income = projectWeeklyIncome(hist, w);
      const good = income >= usual;
      bal += income;
      week = { week_start: iso(d), income: round(income), good_week: good, bills: [],
               daily_spend: (persona.everyday_spend_weekly - (good ? setAside : 0)) / 7,
               bad_week_hit: income * (1 - BAD_WEEK_FACTOR) };
      if (good) setAsideTotal += setAside;
      weeks.push(week);
    }
    for (const b of billsOnDay(persona.recurring, d, opts)) {
      bal -= b.amount;
      week.bills.push({ id: b.id, label: b.label, amount: b.amount, date: iso(d) });
    }
    bal -= week.daily_spend;
    days.push({ date: iso(d), balance: round(bal), bad_week_balance: round(bal - week.bad_week_hit) });
  }

  const risks = [];
  weeks.forEach((wk, w) => {
    const slice = days.slice(w * 7, w * 7 + 7);
    const lowest = slice.reduce((a, b) => (b.balance < a.balance ? b : a));
    const lowestBad = Math.min(...slice.map(x => x.bad_week_balance));
    let severity = null;
    if (lowest.balance < SHORTFALL_BELOW) severity = 'high';
    else if (lowest.balance < WATCH_BELOW || lowestBad < SHORTFALL_BELOW) severity = 'watch';
    if (!severity) return;
    risks.push({
      id: `risk_${wk.week_start}`,
      week_start: wk.week_start,
      severity,
      shortfall: Math.max(0, SHORTFALL_BELOW - lowest.balance),
      bad_week_shortfall: Math.max(0, SHORTFALL_BELOW - lowestBad),
      lowest_day: lowest.date,
      lowest_balance: lowest.balance,
      drivers: [
        ...wk.bills.map(b => ({ type: 'bill', label: b.label, amount: b.amount, date: b.date })),
        { type: 'income', label: 'Expected income this week', amount: wk.income, vs_usual: round(wk.income - usual),
          evidence: `Same week last year you earned £${hist[w % hist.length]}` }
      ]
    });
  });

  return {
    persona_id: persona.persona_id,
    as_of: persona.as_of,
    horizon_days: HORIZON_DAYS,
    currency: persona.currency,
    method: 'Weekly income = 50% median of last 8 weeks + 50% same week last year. Bills from the recurring schedule. Everyday spend spread evenly per day. Bad-week line = that week earning 15% less.',
    usual_weekly_income: round(usual),
    scenario: { set_aside_per_good_week: setAside, spread_yearly: opts.spread_yearly || [], total_set_aside: setAsideTotal },
    end_balance: days[days.length - 1].balance,
    days,
    weeks: weeks.map(({ daily_spend, bad_week_hit, ...w }, i) => ({ ...w, end_balance: days[Math.min(days.length - 1, i * 7 + 6)].balance })),
    risks,
    headline_risk: risks.find(r => r.severity === 'high') || risks[0] || null
  };
}

// ---- CLI (not needed in n8n) ----
if (typeof require !== 'undefined' && require.main === module) {
  const persona = JSON.parse(require('fs').readFileSync(process.argv[2] || 'persona_amira.json', 'utf8'));
  const fix = process.argv[3] === 'fix' ? { set_aside_per_good_week: 20, spread_yearly: ['insurance'] } : {};
  const o = forecast(persona, fix);
  console.log(JSON.stringify({ scenario: o.scenario, usual: o.usual_weekly_income, end_balance: o.end_balance,
    weeks: o.weeks.map(w => `${w.week_start} income £${w.income} end £${w.end_balance}`), risks: o.risks }, null, 1));
}
if (typeof module !== 'undefined') module.exports = { forecast };
