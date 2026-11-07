// Run: node forecast/test.js
const { forecast, canIAfford, simulateNextWeek, bufferPot } = require("./forecast");
const data = require("../data/adam.json");

const f = forecast(data);
const r = f.risks[0];
console.log("Current balance: £" + f.currentBalance, `(${f.currentBalanceHome} ${f.persona.homeCurrency})`);
console.log("Risk:", r.shortfall, "|", r.reason, "|", r.fix);
console.log("Why:", r.why.explanation);

const a = canIAfford(data, { date: "2026-11-20", amount: 150, name: "Extra money sent home" });
console.log("Send £150 home on 20 Nov?", a.affordable ? "yes" : `no, the gap grows by £${a.makesGapBiggerBy}`);

const s = simulateNextWeek(data);
console.log("Simulate next week:", s.changes.join("; "), `| gap £${s.gapBefore} -> £${s.gapAfter}`);

const m = forecast(data, { billChanges: { "Car insurance (annual)": 62 } });
console.log("Pay insurance monthly (£62):", m.risks.length ? `still £${m.risks[0].shortfall} short` : "no short weeks");

const b = bufferPot(data);
console.log(`Buffer pot: £${b.perWeek}/week covers the risk after ${b.coversRisk.coveredAfterWeeks} weeks, £${b.target} by ${b.targetDate}`);
