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
  - `options.extra`: `[{ date, amount, name }]` adds planned spends
  - `options.billChanges`: `{ "Rent": 650 }` changes a bill (for "simulate next week")
- `canIAfford(data, { date, amount, name })` returns `{ affordable, gapBefore, gapAfter, makesGapBiggerBy }`

## Adam's story (data/adam.json)
Delivery rider in Manchester, paid weekly (£230–£420), rent £600, sends £100 home on the 15th, had a £330 e-bike repair in October. His £690 annual car insurance is due on 4 January, the same week as rent. In bad weeks he ends up **£143 short**, and the fix is to **save £16 a week for 9 weeks**.

## To do
- [ ] Give Nulara the chart format (`days[]`: expected line, badCase line, red risk weeks)
- [ ] "Simulate next week" button: `forecast(data, { billChanges: { "Rent": 650 } })`
- [ ] "Can I afford it?" input wired to `canIAfford`
