// Run: node forecast/test.js
const { forecast, canIAfford } = require("./forecast");
const data = require("../data/adam.json");

const f = forecast(data);
console.log("Current balance: £" + f.currentBalance, `(${f.currentBalanceHome} ${f.persona.homeCurrency})`);
console.log("Income per week:", f.income, "Everyday spend per day: £" + f.dailySpend);
console.log("Risks:", JSON.stringify(f.risks, null, 2));
console.log("Lowest expected:", Math.min(...f.days.map((d) => d.expected)), "Lowest bad case:", Math.min(...f.days.map((d) => d.badCase)));

console.log("\nCan I afford to send £150 home on 2026-11-20?");
console.log(JSON.stringify(canIAfford(data, { date: "2026-11-20", amount: 150, name: "Extra money sent home" }), null, 2).slice(0, 400));
