# Future You — Great Uni Hack 2026 Build Plan

Nov 7, 2026 · @Melanius

> **Update (14:15): the persona is now Adam** (`data/adam.json`, Ammar's forecast in `forecast/forecast.js`). Live numbers: in slow weeks Adam is **£143 short from the week of 4 January**, when his £690 annual car insurance lands next to £600 rent. Fixes computed by code: **save £16 a week for 9 weeks** (covers the gap) or **pay the car insurance monthly** (about £62, clears it). Endpoints are `/forecast`, `/coach` and `/future-message`; see `n8n/README.md`. Sections 3, 4, 9 and 10 below were drafted for the earlier persona; their structure still applies, but use the numbers above and the scripts in `n8n/prompts/cached-scripts.md`.

## Assumptions

The build is a browser web app demoed on one laptop, judged live on stage with projector audio, and there is no real phone call: the "call" is an in-app incoming-call screen. If any of these is wrong, only sections 1 and 9 change.

- **One hero persona** drives the whole demo: Adam, 27, Deliveroo rider in Manchester from Libya, Arabic first language, paid weekly (£230–£420). A second English persona is optional.
- **Roles:** P1 Frontend lead (Lovable: shell, language, accessibility). P2 Frontend (call screen, chart, coach UI). P3 Backend AI (n8n /coach, Claude prompts). P4 Data + voice + pitch (forecast script, ElevenLabs, /future-message, demo audio, deck).
- **Voice:** ElevenLabs TTS with a multilingual model for EN + AR and ElevenLabs speech-to-text for replies. A real-time ElevenLabs conversational agent is a COULD, not the core path. Confirm current model IDs in the ElevenLabs dashboard at minute 0.
- **Voice cloning:** we use a stock warm voice by default. The "clone" moment is shown with a team member's own voice, recorded with written consent, which doubles as our consent-flow demo.
- **Forecast runs in n8n** as a Code node (JS), so there is one deployment. The same file also runs locally with Node for testing.
- **Pre-generated audio is the primary demo path, live is the bonus.** We always have both.

## 1. Sanity check: top 5 risks

The biggest risk is not the tech, it is a demo that depends on four live services chained together. Every mitigation below pushes toward cached, deterministic output.

| # | Risk | What breaks | Mitigation | Owner |
| --- | --- | --- | --- | --- |
| 1 | Live chain latency (Claude → ElevenLabs → browser) | 6–15 s of silence on stage after "Answer call" | Cache: `/future-message` returns a pre-generated MP3 URL when `demo_mode=true`. Live path only generates once per persona+language and stores the result. Show a "connecting…" ring animation that covers 3 s. Keep scripts under 70 words. | P4 |
| 2 | Browser audio autoplay block | Call audio never plays | Audio only ever starts from a user gesture: the big "Answer" button calls `audio.play()` in its click handler. Pre-create the `Audio` element on that click, then set `src`. Test in the exact demo browser (Chrome) by 2:00. | P2 |
| 3 | Arabic quality: voice, RTL layout, translation | Robotic or wrong-dialect audio, broken mirrored UI, judges can't follow | Our Arabic-speaking teammate native-checks the first Arabic script by 2:30 and every Arabic clip by 4:00, and asks the live coach question on stage. Use Modern Standard Arabic, short sentences, numbers spoken as words by Claude. Set `dir="rtl"` + `lang="ar"` on `<html>`; keep the chart LTR. Show English subtitles under the Arabic call so judges follow. | P1 + P4 |
| 4 | CORS and payload issues Lovable ↔ n8n | Fetch fails in browser though it works in Postman | Every n8n webhook: Respond to Webhook node with header `Access-Control-Allow-Origin: *` (hackathon only) and allow OPTIONS. Lock the exact JSON contracts in section 3 at minute 20. Frontend builds against a local mock JSON first, switches URL via one config constant. Return audio as a URL or base64 inside JSON, never as a raw binary response. | P3 |
| 5 | Scope creep (voice agent, more languages, Open Banking, logins) | Nothing finished at 4:30 | MUST list is frozen at 0:30. Anything else needs the tech lead's yes. Hard feature freeze at 4:30; 4:30–6:00 is polish, cache, rehearse only. | Tech lead |

Also watch: n8n Cloud execution timeouts on long chains (keep each webhook to one Claude call + one TTS call), and API rate or credit limits (generate demo audio early, not at 5:45).

## 2. Scope: MUST / SHOULD / COULD

The MUST list is one persona, two languages, one forecast, one call, one coach turn. That alone hits all five criteria and the ElevenLabs brief; everything else is garnish.

**MUST (the demo cannot happen without these)**

- [ ] Language picker on first launch (EN, AR), driven by a config array; sets `lang`/`dir` and the voice
- [ ] Dashboard for persona Adam: balance, "next 90 days" chart with the red Feb shortfall week, one plain-language risk card
- [ ] Forecast script (code, not LLM) producing the forecast JSON in section 3
- [ ] Incoming-call screen with user-gesture "Answer" button, plays Future You audio in EN and AR, with on-screen transcript
- [ ] Spoken AI disclosure at the start of every call
- [ ] Coach: hold-to-talk mic → ElevenLabs STT → Claude → ElevenLabs TTS reply, with text transcript shown
- [ ] Signposting card (StepChange, Citizens Advice, MoneyHelper) in the coach reply
- [ ] Keyboard and screen-reader pass on the 3 core screens (labels, focus order, live regions)
- [ ] Cached audio for every demo line + recorded backup video

**SHOULD (big score lift, add only once MUSTs work end-to-end)**

- [ ] Scheduled n8n alert that "discovers" the risk and flips the app into incoming-call state (polling `/alerts`)
- [ ] "Why am I seeing this?" explainer: the 3 transactions that drive the shortfall (transparency)
- [ ] "Try a fix" toggle: set aside £20/good week, chart redraws with the gap closed (financial time travel made visible)
- [ ] High-contrast + large-text toggle
- [ ] Consent screen for voice cloning, then Future You in the user's own cloned voice

**COULD (only if ahead at 4:00)**

- [ ] ElevenLabs real-time conversational agent instead of push-to-talk
- [ ] Third language (Urdu, Polish or Romanian) added by config to prove extensibility
- [ ] Second persona (English, zero-hours carer)
- [ ] SMS/WhatsApp notification

**WON'T:** login, real Open Banking, persistence beyond demo state, mobile app build.

**Cut line and drop order if behind at 4:30.** Freeze at 4:30 regardless. Drop in this order:

1. All COULDs
2. Live voice cloning → keep only the consent screen + pre-made cloned clip
3. Scheduled alert → replace with a hidden "simulate alert" key that triggers the call screen
4. "Try a fix" redraw → show it as a static second chart state
5. Live coach → play a cached coach exchange (question audio + answer audio)

Never drop: the Arabic call, the AI disclosure, the code-computed forecast, the accessibility basics. Those are the pitch.

## 3. Data contracts

Freeze these at 0:20. Frontend builds against `mock/*.json` copies of the responses below and swaps to live by changing one `API_BASE` constant. All endpoints are `POST` with JSON bodies, return JSON (never raw binary), and send `Access-Control-Allow-Origin: *`.

**Language config** (`config/languages.json`, frontend and n8n both read it; add a language = add an entry):

```json
[
  { "code": "en", "label": "English", "native_label": "English", "dir": "ltr",
    "voice_id": "<ELEVEN_VOICE_EN>", "stt_language": "en" },
  { "code": "ar", "label": "Arabic", "native_label": "العربية", "dir": "rtl",
    "voice_id": "<ELEVEN_VOICE_AR>", "stt_language": "ar" }
]
```

**Persona** (`persona_adam.json`, abridged; full file is attached in chat):

```json
{
  "persona_id": "adam", "display_name": "Adam", "language": "ar",
  "as_of": "2026-11-16", "currency": "GBP", "opening_balance": 144,
  "income": { "type": "irregular_weekly",
    "source_label": "Delivery platform payouts (paid Mondays)",
    "history_weekly": [430, 455, 470, "... 52 weeks, oldest first ...", 425, 445] },
  "everyday_spend_weekly": 190,
  "recurring": [
    { "id": "rent", "label": "Rent", "amount": 650, "cadence": "monthly", "day": 9 },
    { "id": "remit", "label": "Money sent to family", "amount": 150, "cadence": "monthly", "day": 1 },
    { "id": "phone", "label": "Phone", "amount": 15, "cadence": "monthly", "day": 20 },
    { "id": "council", "label": "Council tax", "amount": 95, "cadence": "monthly", "day": 1,
      "months": [4,5,6,7,8,9,10,11,12,1] },
    { "id": "insurance", "label": "Scooter insurance (yearly)", "amount": 420,
      "cadence": "yearly", "month": 2, "day": 10 }
  ],
  "recent_transactions": [
    { "date": "2026-11-09", "description": "Platform payout", "amount": 445, "category": "income" },
    { "date": "2026-11-09", "description": "Rent", "amount": -650, "category": "housing" }
  ]
}
```

**`POST /forecast`** (drives the dashboard and chart)

```json
// request
{ "persona_id": "adam",
  "scenario": { "set_aside_per_good_week": 20, "spread_yearly": ["insurance"] } }  // scenario optional

// response (real output of forecast.js, days[] trimmed)
{
  "persona_id": "adam", "as_of": "2026-11-16", "horizon_days": 90, "currency": "GBP",
  "method": "Weekly income = 50% median of last 8 weeks + 50% same week last year. ...",
  "usual_weekly_income": 428,
  "scenario": { "set_aside_per_good_week": 0, "spread_yearly": [], "total_set_aside": 0 },
  "end_balance": -140,
  "days":  [ { "date": "2026-11-16", "balance": 546, "bad_week_balance": 481 } ],
  "weeks": [ { "week_start": "2026-11-16", "income": 429, "good_week": true,
               "bills": [ { "id": "phone", "label": "Phone", "amount": 15, "date": "2026-11-20" } ],
               "end_balance": 368 } ],
  "risks": [ {
    "id": "risk_2027-02-08", "week_start": "2027-02-08", "severity": "high",
    "shortfall": 140, "bad_week_shortfall": 194,
    "lowest_day": "2027-02-13", "lowest_balance": -140,
    "drivers": [
      { "type": "bill", "label": "Rent", "amount": 650, "date": "2027-02-09" },
      { "type": "bill", "label": "Scooter insurance (yearly)", "amount": 420, "date": "2027-02-10" },
      { "type": "income", "label": "Expected income this week", "amount": 356, "vs_usual": -71,
        "evidence": "Same week last year you earned £285" } ] } ],
  "headline_risk": { "...same object as risks[0]...": true }
}
```

**`POST /future-message`**

```json
// request
{ "persona_id": "adam", "language": "ar", "risk_id": "risk_2027-02-08", "demo_mode": true }

// response
{
  "call_id": "adam_ar_risk_2027-02-08",
  "language": "ar", "dir": "rtl",
  "caller_label": "Future You · February 2027",
  "disclosure_text": "هذه رسالة من مساعد ذكاء اصطناعي، وليست نصيحة مالية منظّمة.",
  "script_text": "<full script in the user's language, disclosure first>",
  "subtitle_en": "<English version, shown under Arabic for judges>",
  "audio_url": "/audio/adam_ar_future_call.mp3",   // cached: static file in Lovable public/
  "audio_base64": null,                              // live: mp3 as base64 instead
  "mime": "audio/mpeg",
  "cached": true,
  "numbers_used": { "shortfall": 140, "week_start": "2027-02-08", "rent": 650, "insurance": 420 }
}
```

**`POST /coach`**

```json
// request
{ "persona_id": "adam", "language": "ar", "session_id": "s1", "demo_mode": false,
  "input": { "type": "audio", "audio_base64": "<webm/opus>", "mime": "audio/webm" },
  // or "input": { "type": "text", "text": "What can I do?" }
  "history": [ { "role": "user", "text": "..." }, { "role": "coach", "text": "..." } ] }

// response
{
  "user_transcript": "ماذا أستطيع أن أفعل؟",
  "reply_text": "<coach reply in user's language, max ~80 words>",
  "reply_en": "<English subtitle>",
  "audio_base64": "<mp3>", "audio_url": null, "mime": "audio/mpeg",
  "plan": [
    { "id": "set_aside", "title": "Put £20 aside in your 5 busy weeks before Christmas", "effect": "Gap shrinks from £140 to £40" },
    { "id": "spread_insurance", "title": "Ask your insurer to pay monthly when it renews on 10 Feb (about £38 a month)", "effect": "Gap closes; lowest balance £291 with both steps" }
  ],
  "scenario": { "set_aside_per_good_week": 20, "spread_yearly": ["insurance"] },
  "signposts": [
    { "name": "StepChange", "url": "https://www.stepchange.org", "why": "Free debt advice" },
    { "name": "Citizens Advice", "url": "https://www.citizensadvice.org.uk", "why": "Free help with bills, benefits and rent" },
    { "name": "MoneyHelper", "url": "https://www.moneyhelper.org.uk", "why": "Free, government-backed money guidance" }
  ],
  "disclaimer": "AI coach. Not regulated financial advice."
}
```

The `plan[].effect` strings and `scenario` come from re-running the forecast in code, never from the LLM. The frontend posts `scenario` to `/forecast` to redraw the chart.

**`POST /alerts`** (polled every 5 s by the app; written by the scheduled workflow)

```json
// request
{ "persona_id": "adam", "action": "poll" }        // or "action": "ack", "alert_id": "..."
// response
{ "pending": true,
  "alert": { "alert_id": "a_2027-02-08", "risk_id": "risk_2027-02-08", "severity": "high",
             "created_at": "2026-11-16T09:00:00Z", "short_text": "Future You is calling about February" } }
```

## 4. Forecast logic

The script below has been run on the persona: Adam is **£140 short in the week of 8 Feb 2027** (rent £650 on 9 Feb + scooter insurance £420 on 10 Feb, in a quiet week worth £356 vs her usual £428). Two coach suggestions close the gap, and both results come from code.

| Scenario | Feb 8 week | Lowest balance in 90 days |
| --- | --- | --- |
| Baseline | £140 short (£194 if it's also a bad week) | −£140 on 13 Feb |
| Spend £20 less in each of 5 busy weeks (£100 set aside) | £40 short | −£40 |
| Pay insurance monthly from renewal (\~£38/mo, \~8% dearer) | No shortfall | £192 |
| Both | No shortfall | £291 |

**How it works (explain this to judges in one breath):** weekly income = half your recent typical week, half the same week last year. That last-year half is the "financial time travel": it knows January and February are slow for riders because they were last year. Bills come from the recurring schedule; everyday spending is spread across each day. A week is **high** risk if the balance goes below £0, **watch** if it goes below £50 or would go negative in a bad week (income 15% lower).

**Owner:** P4. Test locally with `node forecast.js persona_adam.json` and `... fix`. In n8n, paste everything above the CLI block into a Code node (Run once for all items) and end with the two lines in the header comment.

```javascript
// Future You — deterministic 90-day cash-flow forecast (no LLM, no randomness).
// Local:  node forecast.js persona_adam.json            -> baseline
//         node forecast.js persona_adam.json fix        -> with the coach's two fixes applied
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
  const persona = JSON.parse(require('fs').readFileSync(process.argv[2] || 'persona_adam.json', 'utf8'));
  const fix = process.argv[3] === 'fix' ? { set_aside_per_good_week: 20, spread_yearly: ['insurance'] } : {};
  const o = forecast(persona, fix);
  console.log(JSON.stringify({ scenario: o.scenario, usual: o.usual_weekly_income, end_balance: o.end_balance,
    weeks: o.weeks.map(w => `${w.week_start} income £${w.income} end £${w.end_balance}`), risks: o.risks }, null, 1));
}
if (typeof module !== 'undefined') module.exports = { forecast };
```

**Pitch line for criterion 4:** "The model never guesses a number. Code forecasts; Claude only translates the forecast into words a person can act on."

## 5. Prompts

All three prompts get numbers only from a `FACTS` JSON block built in code, and all return JSON so n8n can check them. A Code node after each Claude call rejects any reply containing a £ amount or date not in `FACTS` and falls back to a template sentence; this check is a demo talking point.

Pipeline choice: the Future You script is written in English, then translated (better number control and free English subtitles). The coach answers directly in the user's language in one call, because two calls per spoken turn adds 2–4 s of silence.

**(a) Future You script writer**

```text
You write a short voice message from the user's future self, three months ahead.
It will be read aloud by a text-to-speech voice, so write for the ear.

INPUT: a FACTS JSON block computed by code: the user's first name, the risk week,
the shortfall, the bills that cause it, expected vs usual income, last year's
evidence, and up to 3 OPTIONS, each with a pre-computed effect.

RULES
1. Use ONLY numbers, dates, names and amounts that appear in FACTS. Never calculate,
   round differently, estimate or invent a figure. If a number is not in FACTS, leave it out.
2. Start with this exact sentence: "This is an AI-generated message, not financial advice."
3. Then speak as the user's future self: "Hi {name}, it's you, from {risk month}."
   Warm, calm, on their side. Never blame, shame or frighten. No "you should have".
4. Say what happens in plain words: which bills land together, how short it gets.
5. Say 1 or 2 things that would have helped, chosen only from OPTIONS, with their effect.
6. End with: free help exists, name one service from FACTS.signposts, and "open the app to
   talk it through".
7. Plain English, reading age 9. Sentences under 15 words. No jargon (no "liquidity",
   "cash flow", "APR"). Write amounts as "one hundred and forty pounds" style words,
   dates as "the ninth of February".
8. 55 to 75 words total. No lists, no emojis, no stage directions.
9. Do not recommend any financial product, lender, credit, loan, overdraft or
   investment. Do not mention NatWest products.

OUTPUT JSON only:
{"script_en": "...", "numbers_used": ["140", "650", "420", "9 February"],
 "option_ids_used": ["spread_insurance"]}
```

**(b) Coach**

```text
You are "Future You", a friendly AI money coach inside a budgeting app for people on
irregular incomes and people new to the UK. You are an AI and say so if asked.
You are NOT a regulated financial adviser.

Respond in the language with code {language}. Use Modern Standard Arabic for "ar".
Also return an English version for subtitles.

INPUT: FACTS (forecast, risk, OPTIONS with pre-computed effects, signposts) and the
conversation so far. The user spoke; their words were transcribed and may contain errors.

RULES
1. Numbers: use ONLY figures in FACTS. Never do maths. If the user asks about an option
   not in OPTIONS, say you can't calculate that yet and suggest talking to a free adviser.
2. Reply in at most 3 short sentences (max 60 words), spoken style, reading age 9.
   One idea per sentence. Ask at most one question.
3. Suggest only actions from OPTIONS. Explain why each helps in one sentence.
4. Always include at least one signpost id from FACTS.signposts in "signpost_ids".
5. Never recommend borrowing, credit cards, payday loans, Buy Now Pay Later, investments
   or specific providers. Never say "guaranteed" or "you will". Use "the forecast suggests".
6. Non-judgemental: never comment on spending choices, remittances to family, religion
   or culture. Sending money home is a fixed commitment, not a problem to cut.
7. If the user mentions not affording food or rent now, threats from creditors, gambling
   harm, or feeling hopeless or unsafe: set "escalate": true, reply with care, and point to
   free help (Citizens Advice, StepChange; Samaritans on 116 123 for emotional crisis).
   Do not continue budgeting advice in that turn.
8. If you did not understand the transcript, say so kindly and ask them to repeat.
9. Never ask for passwords, card numbers or bank login details.

OUTPUT JSON only:
{"reply_text": "...in {language}...", "reply_en": "...", "option_ids": ["set_aside"],
 "signpost_ids": ["stepchange"], "escalate": false}
```

**(c) Translation**

```text
You translate short, spoken financial-coaching messages for text-to-speech.
Translate the INPUT text from English into {language_name} ({language_code}).

RULES
1. Meaning must be identical. Do not add, remove or soften any fact, warning or disclaimer.
2. Keep every amount and date exactly equal to the source. Write amounts and dates as
   words the way a native speaker would say them aloud (for Arabic: Modern Standard
   Arabic, "pounds" as جنيه إسترليني).
3. Keep the opening AI disclosure as the first sentence, translated faithfully.
4. Plain, warm, everyday register a recent arrival would understand. Short sentences.
   Avoid formal legal or banking vocabulary; if a term has no common equivalent, keep
   the English name (e.g. "StepChange", "Citizens Advice") untranslated.
5. Keep proper names and organisation names in Latin script.
6. Output only JSON: {"text": "...", "amounts_preserved": ["140", "650", "420"]}
   where amounts_preserved lists the numeric values you carried over, as digits.
```

The n8n check compares `amounts_preserved` and `numbers_used` against `FACTS`; any mismatch → use the cached script for that language.

## 6. n8n workflow outlines

Four small workflows, each one Claude call and at most one ElevenLabs call. Keys live in n8n Credentials (Header Auth): `x-api-key` for Anthropic, `xi-api-key` for ElevenLabs. Confirm current model IDs on day: Claude Haiku for the coach (speed), Claude Sonnet for the script; ElevenLabs multilingual TTS model and Scribe STT model.

**Shared setup (P3, by 0:45)**

- Every Webhook node: Method POST, Respond = "Using Respond to Webhook node", Options → Allowed Origins = `*`.
- Every Respond to Webhook node: JSON body, header `Access-Control-Allow-Origin: *`.
- A "Persona store" Code node (copy-paste into each workflow) that returns `persona_adam.json` by `persona_id`.
- A "Forecast" Code node containing `forecast.js` (section 4).
- A "Signposts" constant: StepChange, Citizens Advice, MoneyHelper with ids, URLs, one-line why.

**Workflow 0: `/forecast`** (P4, 15 minutes)

1. Webhook `/forecast`
2. Code: Persona store → `{ persona, scenario }`
3. Code: Forecast → forecast JSON
4. Respond to Webhook

**Workflow 1: `/future-message`** (P4)

1. Webhook `/future-message`
2. IF `demo_mode == true` → Code "Cache lookup": return `{ audio_url: "/audio/adam_{lang}_future_call.mp3", script_text, subtitle_en, cached: true }` from a hard-coded map → Respond. **Done in under 200 ms.**
3. Else: Code Persona store → Code Forecast → Code "Build FACTS": name, `headline_risk`, signposts, and OPTIONS made by re-running `forecast()` with `{set_aside_per_good_week: 20}`, `{spread_yearly: ["insurance"]}` and both, recording each scenario's shortfall and lowest balance.
4. HTTP Request → `POST https://api.anthropic.com/v1/messages`, headers `anthropic-version: 2023-06-01`, body: system = prompt (a), user = `FACTS:` + JSON, `max_tokens: 400`.
5. Code "Guard": parse JSON; check every £ figure in `script_en` is in FACTS; on failure use the English template script.
6. IF `language != "en"` → HTTP Request to Claude with prompt (c) → Code guard on `amounts_preserved`.
7. HTTP Request → `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` (voice from languages config), body `{ "text": ..., "model_id": "<multilingual model>" }`, Response format = File.
8. Code: binary → base64 (`(await this.helpers.getBinaryDataBuffer(0, 'data')).toString('base64')`).
9. Respond: section 3 shape with `audio_base64`, `cached: false`.

**Workflow 2: `/coach`** (P3)

1. Webhook `/coach`
2. IF `input.type == "audio"` → Code: base64 → binary (`this.helpers.prepareBinaryData(Buffer.from(b64,'base64'), 'speech.webm', 'audio/webm')`) → HTTP Request `POST https://api.elevenlabs.io/v1/speech-to-text`, multipart form: `file` (binary), `model_id`, `language_code` from config → `user_transcript`. Else take `input.text`.
3. Code: Persona store → Forecast → Build FACTS (same as workflow 1, plus last 6 turns of `history`).
4. HTTP Request → Claude with prompt (b), `max_tokens: 300`.
5. Code "Guard": parse JSON; validate numbers; map `option_ids` to `plan[]` (title + effect strings come from FACTS, not from the model) and to `scenario`; map `signpost_ids` to full signposts; if `escalate`, force Citizens Advice + StepChange signposts.
6. HTTP Request → ElevenLabs TTS on `reply_text` (use a low-latency/flash model here if Arabic quality holds).
7. Code: binary → base64 → Respond with section 3 shape.

If STT or TTS fails at step 2 or 6, still return the text reply with `audio_base64: null`; the UI shows text and the screen reader reads it.

**Workflow 3: scheduled alert + `/alerts`** (P3, SHOULD)

Both triggers live in **one** workflow so they share `$getWorkflowStaticData('global')`. Static data only persists in active (production) runs, not manual test runs.

- Branch A: Schedule Trigger (every 1 minute in demo) → Persona store → Forecast → Code: if `headline_risk` exists and its id differs from `staticData.last_alerted_risk`, set `staticData.pending = { alert_id, risk_id, severity, created_at, short_text }` and `last_alerted_risk = risk_id`.
- Branch B: Webhook `/alerts` → Code: `poll` returns `{ pending: !!staticData.pending, alert: staticData.pending }`; `ack` clears `pending` → Respond.
- Demo trigger: a hidden `reset` action clears `last_alerted_risk`, so the next scheduled run "discovers" February live on stage. Backup: the app's secret key (press `F` three times) triggers the call screen locally.
- Production path (say it, don't build it): Open Banking feed → nightly forecast → push notification + optional real phone call via a telephony provider.

## 7. Lovable prompts

Paste in order. P1 runs prompt 1 then 2; P2 runs 3 then 4 in a branch and merges at 2:00. Put the cached MP3s in `public/audio/` and the mock responses in `src/mock/`.

**Prompt 1: shell, language picker, accessibility foundation (P1)**

```text
Build a mobile-first web app called "Future You", an AI money coach for people on irregular
incomes and people new to the UK. React + TypeScript + Tailwind. No login, no database.

LANGUAGES
- Create src/config/languages.json: [{code:"en",label:"English",native_label:"English",dir:"ltr"},
  {code:"ar",label:"Arabic",native_label:"العربية",dir:"rtl"}]. All UI strings live in
  src/i18n/{code}.json. Adding a language must only need a new config entry + strings file.
- First launch shows a full-screen language picker: one very large button per language,
  labelled in its own script (native_label), plus a speaker icon button that plays
  /audio/lang_{code}.mp3 ("Tap here for English" / the Arabic equivalent).
- On select: save to localStorage (wrap in try/catch), set <html lang> and <html dir>
  to the language's values. Changeable later from a header button.

RTL
- Use logical CSS (Tailwind ms-/me-/ps-/pe-, text-start) everywhere so the layout mirrors
  in Arabic. Icons with direction (arrows) flip in RTL. Charts and numbers stay LTR
  (wrap them in dir="ltr").
- Arabic font: "Noto Sans Arabic" from Google Fonts; Latin: "Atkinson Hyperlegible".

ACCESSIBILITY (must pass keyboard-only and screen-reader use)
- Semantic landmarks: header, nav, main. One h1 per screen. Skip-to-content link.
- Every button and icon button has an aria-label in the current language.
- Visible focus ring (3px, high contrast). Logical tab order. No focus traps except
  modal dialogs, which return focus on close.
- Base font 18px, tap targets at least 48x48px, contrast at least 7:1 (AAA).
- Header has a "High contrast" toggle and a "Larger text" toggle (125%).
- An aria-live="polite" region at the top of main announces state changes.
- Respect prefers-reduced-motion.
- Plain-language copy, reading age 9. Footer on every screen: "AI coach. Not financial advice."

API
- src/config/api.ts exports API_BASE (n8n webhook base URL) and USE_MOCK (true by default).
  When USE_MOCK is true, functions in src/api.ts return the JSON in src/mock/*.json.
- Never put any API key in the frontend.

Routes: / (language picker if none chosen, else dashboard), /call, /coach.
```

**Prompt 2: dashboard and forecast chart (P1)**

```text
Build the dashboard at "/" using data from api.getForecast({persona_id:"adam", scenario?})
which returns the JSON in src/mock/forecast.json (shape: days[], weeks[], risks[],
headline_risk, usual_weekly_income, end_balance).

Layout (top to bottom):
1. Greeting: "Hi Adam" and today's balance (days[0].balance), large.
2. Risk card (only if headline_risk): red left border, icon, heading "A hard week is coming",
   text "Week of {week_start}: you could be £{shortfall} short." Below it a
   "Why?" disclosure button that expands the drivers list (bill label, amount, date;
   income vs usual, and the evidence sentence). Buttons: "Hear from Future You" (-> /call)
   and "Talk to the coach" (-> /coach).
3. 90-day chart (Recharts LineChart): x = date, y = £ balance. Line for balance; dashed
   line for bad_week_balance; a red shaded reference area for the risk week; a
   horizontal reference line at £0 labelled "£0". Wrap chart in dir="ltr".
   The chart has role="img" and an aria-label summarising it in one sentence, e.g.
   "Your balance stays above zero until the week of 8 February, when it drops to minus 140 pounds."
   Below the chart, a visually-hidden table of weekly end balances for screen readers.
4. "Try a fix" section: two toggle switches, "Put £20 aside in busy weeks" and
   "Pay insurance monthly". On change, call getForecast with scenario
   {set_aside_per_good_week: 20 or 0, spread_yearly: ["insurance"] or []} and redraw.
   Announce the result in the aria-live region: "With these changes, no short weeks
   in the next 90 days."
5. "How this works" link opening a dialog: the forecast is calculated by code from your
   past 12 months; the AI only explains it; demo data only; not financial advice.
All copy in the current language from i18n files. Money formatted with Intl.NumberFormat
for en-GB, digits shown in Western Arabic numerals in both languages.
```

**Prompt 3: incoming call screen (P2)**

```text
Build /call, a full-screen "incoming call" screen styled like a phone call.

State 1 RINGING: dark background, avatar circle with the user's initial and a soft
pulsing ring (static if prefers-reduced-motion), caller name "Future You", subtitle
"Calling from February 2027", label "AI message" chip. Two big round buttons:
"Answer" (green, aria-label "Answer call from Future You") and "Decline" (aria-label
"Decline call"). On mount, move focus to Answer and announce via aria-live "Incoming
 call from Future You. Press Answer to listen." Optional ringtone must NOT autoplay.

AUDIO AUTOPLAY RULE: audio may only start inside the Answer button's click handler.
In that handler: create const audio = new Audio(); call audio.play() on a silent
/audio/silence.mp3 first to unlock, then call api.getFutureCall({persona_id:"adam",
language, risk_id, demo_mode: DEMO_MODE}); set audio.src to response.audio_url, or to
"data:audio/mpeg;base64,"+response.audio_base64; then audio.play().
If the API takes longer than 4 s or fails, play /audio/adam_{language}_future_call.mp3.

State 2 IN CALL: call timer, waveform animation driven by playback, and a live
transcript panel showing script_text in the current language with dir set
accordingly, and subtitle_en underneath in smaller text when language is not English
(toggle "Show English"). Buttons: Pause/Play, Replay, "Talk back" (-> /coach), End.
The transcript is the accessible equivalent of the audio: it is always present
in the DOM, not hidden from screen readers.

State 3 ENDED: "Call ended" summary card listing the risk (week, shortfall) and two
buttons: "Make a plan with the coach" and "Back home".
Also: pressing the F key three times anywhere in the app navigates to /call
(demo trigger), and the app polls api.pollAlerts every 5 s; when pending is true,
navigate to /call and send action "ack".
```

**Prompt 4: voice coach (P2)**

```text
Build /coach, a voice-first chat with the AI coach.

- Top: "AI coach. Not financial advice." banner, always visible.
- Middle: conversation list (role="log", aria-live="polite"). Each coach message shows
  text in the current language, an optional English subtitle line, a play button for its
  audio, plan cards (title + effect) and signpost cards (name, one-line why, link opening
  in a new tab with aria-label "opens in new tab").
- Bottom: one very large circular mic button "Hold to talk" (also works as press to start /
  press to stop for keyboard and switch users; Space and Enter toggle recording). While
  recording: red pulse, "Listening..." text, aria-pressed="true". Use MediaRecorder
  (audio/webm). On stop, send api.coach({persona_id:"adam", language, session_id, input:
  {type:"audio", audio_base64, mime:"audio/webm"}, history}). Show the user_transcript as
  the user's bubble, then the coach reply, then auto-play the reply audio (allowed because
  it follows the user's tap). Next to the mic, a small "Type instead" text input.
- Three suggestion chips for first use, in the current language: "What can I do?",
  "Can I move a bill?", "Where can I get free help?".
- Loading state: "Thinking..." bubble with three dots, announced to screen readers.
- If the response has scenario, show a button "See this on my forecast" -> "/" with the
  scenario toggles switched on.
- If audio is null, just show text. If mic permission is denied, explain in one sentence
  and focus the text input.
- If escalate is true, show the signpost cards first in a calm, highlighted panel.
```

## 8. Hour-by-hour timeline

Four checkpoints, each 10 minutes, standing, with the demo laptop: **1:30 (first wire), 3:00 (end-to-end), 4:30 (freeze), 5:30 (dress rehearsal)**. A checkpoint that fails triggers the cut list in section 2, not overtime.

| Time | P1 Frontend lead | P2 Frontend | P3 Backend AI | P4 Data, voice, pitch |
| --- | --- | --- | --- | --- |
| 0:00–0:30 | All four: read this doc, freeze contracts (§3), create Lovable project, n8n workspace, ElevenLabs and Anthropic keys in n8n credentials | ← | ← | ← |
| 0:30–1:30 | Lovable prompt 1 (shell, languages, a11y, RTL) | Lovable prompt 3 (call screen) against mock JSON + a placeholder MP3 | Shared setup; `/coach` text-only path (Claude + guard) | `forecast.js` into `/forecast` workflow; pick EN and AR voices; generate first test MP3s |
| **1:30 checkpoint** | Frontend calls live `/forecast` and renders numbers | Answer button plays audio in demo browser | `/coach` returns JSON from Postman | `/forecast` live; Arabic test clip played to an Arabic speaker |
| 1:30–3:00 | Lovable prompt 2 (dashboard, chart, risk card, Try a fix) | Lovable prompt 4 (coach screen, mic recording) | `/coach` audio in: STT → Claude → TTS; signposts; escalate path | `/future-message` live path (prompts a + c, guards, TTS); write and approve EN + AR scripts |
| **3:00 checkpoint** | Full flow on one laptop: language → dashboard → call (live) → coach (one spoken turn) → Try a fix redraw. Log every failure. | ← | ← | ← |
| 3:00–4:30 | Merge branches; a11y pass with keyboard + VoiceOver/NVDA; Arabic RTL fixes | Polish call screen; alerts polling + F-F-F trigger; error/fallback states | Scheduled alert workflow; latency tuning; CORS edge cases | Generate ALL cached audio (§10); slides (5 max); demo script draft |
| **4:30 FREEZE** | No new features. Only bugs, copy, cache, rehearsal. | ← | ← | ← |
| 4:30–5:30 | Bug fixes from rehearsal 1; high-contrast check on projector | Record backup demo video (screen + system audio), both languages | Turn `DEMO_MODE` on; confirm cached path works with Wi-Fi off | Run rehearsal 1 at 4:40 and rehearsal 2 at 5:10; time each to 3:00 |
| **5:30 dress rehearsal** | Final run on the demo laptop, projector, speaker. Video and MP3s on a USB stick + phone. | ← | ← | ← |
| 5:30–6:00 | Buffer; submission form, repo link, README | Buffer | Buffer | Submit video + slides |

## 9. Demo script (3:00)

One presenter (P4) talks; P1 drives the laptop; nobody else speaks. The Arabic call is the emotional peak and must land by 1:30. Criteria tags: **C1** customer focus, **C2** innovation, **C3** social impact, **C4** AI and data, **C5** feasibility, **EL** ElevenLabs.

| Time | On screen | Presenter says (paraphrase, don't read) | Hits |
| --- | --- | --- | --- |
| 0:00–0:20 | Title slide: Adam's photo-free persona card | "Adam delivers food in Manchester. He came from Libya. His pay changes every week, and English is his second language. Budgeting apps show him where his money went. None of them warn him, in Arabic, about January." | C1, C3 |
| 0:20–0:35 | Language picker; tap العربية; layout mirrors | "First thing she sees: choose your language, spoken aloud, in its own script. Everything mirrors right-to-left." | C1, C3 |
| 0:35–1:00 | Dashboard, 90-day chart, red week | "Our forecast is plain code, not AI. It blends her last eight weeks with the same weeks last year. Last January was slow for riders, so it knows this one will be. Rent and her yearly scooter insurance land in the same quiet week: she'll be £140 short on 13 February." Tap "Why?" | C4, C5 |
| 1:00–1:40 | Alert fires → incoming call → tap Answer → Arabic audio plays with English subtitles | "Three months early, Future You calls." Let 20–25 s of the Arabic audio play uninterrupted. Then: "It opens by saying it's AI and not advice. It's her own future self, in her language, telling her what would have helped." | C2, EL, C3 |
| 1:40–2:15 | Coach: hold mic, a teammate asks in Arabic "ماذا أستطيع أن أفعل؟" (What can I do?) → spoken Arabic reply + plan cards + StepChange/Citizens Advice | "She talks back. ElevenLabs transcribes her, Claude explains options our code already priced, ElevenLabs answers in her language. It never offers credit. It always points to free help." | EL, C4, C3 |
| 2:15–2:30 | Toggle "Try a fix": chart redraws, red week gone | "Put £20 aside in five busy weeks and pay the insurance monthly at renewal: no short week, lowest balance £291. That's financial time travel." | C4, C1 |
| 2:30–2:45 | Screen reader on: Tab to Answer, VoiceOver reads it | "And it works eyes-free: every screen works by voice and screen reader, for blind users with limited English too." | C1, C3 |
| 2:45–3:00 | Final slide: architecture strip + guardrails + roadmap | "Code forecasts, AI explains, voice reaches people text can't. Mock data today; Open Banking tomorrow, which NatWest already supports. Most budgeting apps tell you where your money went. Future You tells you where it's going, and calls you before it's too late." | C5, C3 |

**Lines to have ready for Q&A**

- *Why not let the LLM forecast?* Numbers must be auditable and identical every run. The LLM only gets numbers from code, and a guard rejects any figure it invents.
- *Is this financial advice?* No. It's guidance and signposting, disclosed on every call and screen; it never recommends products or credit.
- *Bias and fairness?* No credit scoring, no decisions about the user. Remittances are treated as fixed commitments, not "waste".
- *Voice cloning?* Only your own voice, only with explicit consent, deletable. Default is a stock voice.
- *Production?* Open Banking feed, nightly forecast job, push notification or opt-in phone call, more languages by config.

**Backup plan (decide in 5 seconds, never debug on stage)**

1. Live call slow (>4 s): the app auto-falls back to the cached MP3. Keep talking.
2. n8n or Wi-Fi down: flip `DEMO_MODE` (already on), everything served from `public/audio` and `src/mock`. Demo is identical.
3. Mic fails: tap the "What can I do?" chip; it plays the cached coach exchange.
4. Laptop or projector fails: play the recorded 3-minute video from the USB stick, narrate over it.

## 10. Fallback: cached demo audio

By 4:30 every sound the judges will hear exists as an MP3 in `public/audio/`, and `DEMO_MODE=true` serves them with zero API calls. Live generation is a bonus we show only if the 5:30 rehearsal is clean.

**Generate through n8n, not with keys on a laptop.** P4 runs `generate-cache.js` (attached in chat) with `N8N_BASE` set. It calls `/forecast`, `/future-message` and `/coach` with `demo_mode: false`, then writes the MP3s and matching mock JSON straight into the Lovable folder layout.

| File in `public/audio/` | Used by | Approved by |
| --- | --- | --- |
| `adam_ar_future_call.mp3` | The hero call | Arabic speaker, by 4:00 |
| `adam_en_future_call.mp3` | English demo and backup | P4 |
| `adam_ar_coach_1..3.mp3` | Arabic answers to the 3 chips | Arabic speaker |
| `adam_en_coach_1..3.mp3` | English answers to the 3 chips | P4 |
| `lang_en.mp3`, `lang_ar.mp3` | Spoken language picker | P1 |
| `user_question_ar.mp3` | Recorded teammate asking "What can I do?" in Arabic, for a scripted coach turn if the mic fails | P4 |
| `silence.mp3` | Audio unlock on Answer tap | P2 |

**Approved English call script (55–75 words, numbers from the forecast):**

> This is an AI-generated message, not financial advice. Hi Adam, it's you, from February. The ninth and tenth were hard. Rent and the scooter insurance came in the same quiet week. We ended up one hundred and forty pounds short. Two things would have helped. Paying the insurance monthly when it renewed. And putting twenty pounds aside in the busy weeks before Christmas. Citizens Advice can help for free. Open the app, and let's talk it through.

**Draft Arabic call script (must be checked by a native speaker before recording):**

> هذه رسالة من الذكاء الاصطناعي، وليست نصيحة مالية. مرحبًا أميرة، أنا أنتِ، من شهر فبراير. كان اليومان التاسع والعاشر صعبين. جاء الإيجار وتأمين الدراجة في الأسبوع نفسه، وكان العمل قليلًا. كان ينقصنا مئة وأربعون جنيهًا. شيئان كانا سيساعداننا: أن ندفع التأمين شهريًا عند تجديده، وأن نضع عشرين جنيهًا جانبًا في أسابيع العمل الكثيرة قبل رأس السنة. منظمة Citizens Advice تساعد مجانًا. افتحي التطبيق، ولنتحدث معًا.

**Cache checklist (P4, 4:00–4:30)**

- [ ] Listen to every MP3 end to end on the demo laptop's speaker
- [ ] Arabic files approved by a native speaker (pronunciation of numbers and "Citizens Advice")
- [ ] Set `DEMO_MODE=true` and `USE_MOCK=true`, turn Wi-Fi off, run the full demo: must be identical
- [ ] Record the 3-minute backup video with system audio; copy video + `public/audio` to USB stick and a phone
- [ ] Voice clone (if used): signed consent note from the teammate whose voice it is, kept with the slides
