# Forecast (Ammar)

`forecast.js` is plain JavaScript with no dependencies and no AI. It can be used unchanged in the frontend, in an n8n Code node, or in Node.

```
node forecast/test.js
```

## What it does
1. **Current balance** = starting balance + all past transactions.
2. **Income pattern**: low, typical and high weeks (25th, 50th, 75th percentile of weekly pay).
3. **Everyday spend**: average per day (groceries, transport, eating out).
4. **90 days forward**, twice: `expected` (typical weeks) and `badCase` (low weeks every week).
5. **Risks**: periods where `badCase` drops below £0, with the bills that trigger it and a fix ("Save £16 a week for 9 weeks").

## Functions
- `forecast(data, options)` returns `{ currentBalance, currentBalanceHome, income, dailySpend, days, risks }`
  - `days[]`: `{ date, expected, badCase, events }` for the chart
  - `risks[]`: `{ week, shortfall, reason, fix, saveWeekly, weeksUntil, why }`
  - `risks[].why`: the "Why am I seeing this?" breakdown: `payRange`, `billsThatWeek`, `everydaySpendPerWeek`, `lowestBadCase`, `explanation`
  - `options.extra`: `[{ date, amount, name }]` adds planned spends
  - `options.billChanges`: `{ "Rent": 650 }` changes a bill
  - `options.payChanges`: `{ "2026-11-09": 180 }` changes one payday
- `canIAfford(data, { date, amount, name })` returns `{ affordable, gapBefore, gapAfter, makesGapBiggerBy }`
- `simulateNextWeek(data)`: rent goes up £50 and the next payday is slow. Returns `{ alert, changes, gapBefore, gapAfter, risk, options, forecast }`
- `bufferPot(data, { perWeek, target })`: emergency fund plan. Returns `{ perWeek, target, weeksToTarget, targetDate, coversRisk, milestones }`

## Via n8n (`/forecast`)
| Body | Returns |
|---|---|
| `{}` | Adam's forecast |
| `{ "options": { "billChanges": {...}, "payChanges": {...} } }` | forecast with changes |
| `{ "canIAfford": { "date", "amount", "name" } }` | yes/no and how much the gap grows |
| `{ "simulate": "next_week" }` | the new alert for the demo |
| `{ "bufferPot": true }` | emergency fund plan |

## Adam's story (data/adam.json)
Delivery rider in Manchester, paid weekly (£230–£420), rent £600, sends £100 home on the 15th, had a £330 e-bike repair in October. His £690 annual car insurance is due on 4 January, the same week as rent. In bad weeks he ends up **£143 short**, and the fix is to **save £16 a week for 9 weeks**.

## Results for Adam
- £143 short from early January (car insurance and rent), fix: save £16 a week for 9 weeks
- Paying the insurance monthly (£62) removes the short week completely
- Sending an extra £150 home on 20 Nov makes the gap £150 bigger
- Simulate next week: gap grows from £143 to £355 (alert)
- Buffer pot: £16 a week covers the gap after 9 weeks and reaches £500 by June 2027

## To do
- [x] "Why am I seeing this?" data (`risks[].why`)
- [x] "Simulate next week"
- [x] "Can I afford it?"
- [x] Buffer pot
- [ ] Paste the new `n8n/forecast-code-node.js` into the `/forecast` Code node and publish
- [ ] Help Nulara wire the chart, "Why am I seeing this?", simulate button and buffer pot
