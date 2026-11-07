import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { o as useLanguage, r as cn } from "./button-CjzHUPf3.mjs";
import { r as loadCurrency } from "./currency-BVmo3hFw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-CejQXid0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Approximate units of each currency per £1. Hard-coded for the demo; not live rates. */
var GBP_RATES = {
	GBP: 1,
	LYD: 6.9,
	PLN: 5.1,
	INR: 112,
	PKR: 375,
	BDT: 160,
	EGP: 64,
	NGN: 2050,
	PHP: 76,
	USD: 1.33,
	EUR: 1.17,
	AED: 4.9,
	SAR: 5,
	CAD: 1.83
};
function convertFromGbp(amount, currency) {
	return amount * GBP_RATES[currency];
}
var MONEY_MODE_STORAGE_KEY = "futureyou.moneyMode";
var EVENT = "futureyou:moneymode";
function loadMoneyMode() {
	if (typeof window === "undefined") return "gbp";
	const value = window.localStorage.getItem(MONEY_MODE_STORAGE_KEY);
	return value === "home" || value === "both" ? value : "gbp";
}
function saveMoneyMode(mode) {
	window.localStorage.setItem(MONEY_MODE_STORAGE_KEY, mode);
	window.dispatchEvent(new Event(EVENT));
}
function subscribe(cb) {
	window.addEventListener(EVENT, cb);
	window.addEventListener("storage", cb);
	return () => {
		window.removeEventListener(EVENT, cb);
		window.removeEventListener("storage", cb);
	};
}
/** Home currency other than GBP, or null when there is nothing to convert to. */
function homeCurrencyForDisplay() {
	const c = loadCurrency();
	return c && c !== "GBP" ? c : null;
}
function useMoneyMode() {
	const mode = (0, import_react.useSyncExternalStore)(subscribe, loadMoneyMode, () => "gbp");
	const home = (0, import_react.useSyncExternalStore)(subscribe, homeCurrencyForDisplay, () => null);
	return {
		mode: home ? mode : "gbp",
		home
	};
}
var gbp = new Intl.NumberFormat("en-GB", {
	style: "currency",
	currency: "GBP",
	maximumFractionDigits: 2,
	minimumFractionDigits: 0
});
var whole = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
var formatHome = (amount, code) => `≈ ${code} ${whole.format(amount)}`;
/**
* Displays a GBP amount following the saved display mode (GBP, home currency, or both).
* Use for every money amount in the app.
*/
function Money({ amount, className }) {
	const { mode, home } = useMoneyMode();
	const pounds = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
		dir: "ltr",
		children: gbp.format(amount)
	});
	if (!home || mode === "gbp") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		children: pounds
	});
	const converted = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
		dir: "ltr",
		children: formatHome(convertFromGbp(amount, home), home)
	});
	if (mode === "home") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		children: converted
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex flex-col align-middle leading-tight", className),
		children: [pounds, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[0.6em] font-semibold opacity-80",
			children: converted
		})]
	});
}
function MoneyModeToggle() {
	const { t } = useLanguage();
	const { mode, home } = useMoneyMode();
	if (!home) return null;
	const options = [
		{
			value: "gbp",
			label: "£ GBP"
		},
		{
			value: "home",
			label: home
		},
		{
			value: "both",
			label: t("bothCurrencies")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "radiogroup",
		"aria-label": t("showAmountsIn"),
		className: "grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1",
		children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			role: "radio",
			"aria-checked": mode === o.value,
			onClick: () => saveMoneyMode(o.value),
			className: cn("min-h-12 rounded-xl px-2 text-lg font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring", mode === o.value ? "bg-secondary text-secondary-foreground" : "text-secondary"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", { children: o.label })
		}, o.value))
	}), mode !== "gbp" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-base text-muted-foreground",
		children: t("approxRateNote")
	})] });
}
var adam_default = {
	persona: {
		"id": "adam",
		"name": "Adam",
		"age": 27,
		"city": "Manchester",
		"job": "Delivery rider (Deliveroo), paid weekly",
		"language": "ar",
		"homeCountry": "Libya",
		"homeCurrency": "LYD",
		"gbpToHome": 6.9,
		"startBalance": 0,
		"historyStart": "2026-08-03",
		"today": "2026-11-07"
	},
	knownBills: [
		{
			"name": "Rent",
			"amount": 600,
			"dayOfMonth": 1
		},
		{
			"name": "Phone",
			"amount": 15,
			"dayOfMonth": 8
		},
		{
			"name": "Money sent home",
			"amount": 100,
			"dayOfMonth": 15
		},
		{
			"name": "Car insurance (annual)",
			"amount": 690,
			"date": "2027-01-04"
		}
	],
	transactions: [
		{
			"date": "2026-08-03",
			"amount": 312,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-08-03",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-08-05",
			"amount": -25.89,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-08-07",
			"amount": -13.21,
			"type": "spend",
			"category": "Eating out"
		},
		{
			"date": "2026-08-08",
			"amount": -15,
			"type": "bill",
			"category": "Phone"
		},
		{
			"date": "2026-08-08",
			"amount": -22.87,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-08-10",
			"amount": 268,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-08-10",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-08-12",
			"amount": -28.43,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-08-14",
			"amount": -8.46,
			"type": "spend",
			"category": "Eating out"
		},
		{
			"date": "2026-08-15",
			"amount": -100,
			"type": "transfer",
			"category": "Money sent home"
		},
		{
			"date": "2026-08-15",
			"amount": -28.09,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-08-17",
			"amount": 405,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-08-17",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-08-19",
			"amount": -22.45,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-08-21",
			"amount": -8.56,
			"type": "spend",
			"category": "Eating out"
		},
		{
			"date": "2026-08-22",
			"amount": -23.09,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-08-24",
			"amount": 251,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-08-24",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-08-26",
			"amount": -27.09,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-08-29",
			"amount": -23.49,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-08-31",
			"amount": 355,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-08-31",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-09-01",
			"amount": -600,
			"type": "bill",
			"category": "Rent"
		},
		{
			"date": "2026-09-02",
			"amount": -24.68,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-09-05",
			"amount": -33.37,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-09-07",
			"amount": 240,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-09-07",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-09-08",
			"amount": -15,
			"type": "bill",
			"category": "Phone"
		},
		{
			"date": "2026-09-09",
			"amount": -28.93,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-09-11",
			"amount": -15.81,
			"type": "spend",
			"category": "Eating out"
		},
		{
			"date": "2026-09-12",
			"amount": -22.56,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-09-14",
			"amount": 298,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-09-14",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-09-15",
			"amount": -100,
			"type": "transfer",
			"category": "Money sent home"
		},
		{
			"date": "2026-09-16",
			"amount": -32.3,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-09-18",
			"amount": -9.15,
			"type": "spend",
			"category": "Eating out"
		},
		{
			"date": "2026-09-19",
			"amount": -23.41,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-09-21",
			"amount": 244,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-09-21",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-09-23",
			"amount": -25.7,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-09-26",
			"amount": -24.17,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-09-28",
			"amount": 420,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-09-28",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-09-30",
			"amount": -28.98,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-10-01",
			"amount": -600,
			"type": "bill",
			"category": "Rent"
		},
		{
			"date": "2026-10-03",
			"amount": -26.47,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-10-05",
			"amount": 276,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-10-05",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-10-07",
			"amount": -28.57,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-10-08",
			"amount": -15,
			"type": "bill",
			"category": "Phone"
		},
		{
			"date": "2026-10-09",
			"amount": -8.48,
			"type": "spend",
			"category": "Eating out"
		},
		{
			"date": "2026-10-10",
			"amount": -24.47,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-10-12",
			"amount": 230,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-10-12",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-10-14",
			"amount": -30.16,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-10-15",
			"amount": -100,
			"type": "transfer",
			"category": "Money sent home"
		},
		{
			"date": "2026-10-16",
			"amount": -10.51,
			"type": "spend",
			"category": "Eating out"
		},
		{
			"date": "2026-10-17",
			"amount": -29.03,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-10-19",
			"amount": 331,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-10-19",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-10-20",
			"amount": -330,
			"type": "one-off",
			"category": "E-bike repair"
		},
		{
			"date": "2026-10-21",
			"amount": -27.44,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-10-23",
			"amount": -14.36,
			"type": "spend",
			"category": "Eating out"
		},
		{
			"date": "2026-10-24",
			"amount": -30.39,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-10-26",
			"amount": 238,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-10-26",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-10-28",
			"amount": -24.93,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-10-30",
			"amount": -12.2,
			"type": "spend",
			"category": "Eating out"
		},
		{
			"date": "2026-10-31",
			"amount": -32.5,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-11-01",
			"amount": -600,
			"type": "bill",
			"category": "Rent"
		},
		{
			"date": "2026-11-02",
			"amount": 288,
			"type": "income",
			"category": "Deliveroo pay"
		},
		{
			"date": "2026-11-02",
			"amount": -20,
			"type": "spend",
			"category": "Transport"
		},
		{
			"date": "2026-11-04",
			"amount": -30.75,
			"type": "spend",
			"category": "Groceries"
		},
		{
			"date": "2026-11-06",
			"amount": -15.84,
			"type": "spend",
			"category": "Eating out"
		}
	]
};
var billKeys = [
	"rent",
	"energy",
	"wifi",
	"phone",
	"other"
];
var PROFILE_STORAGE_KEY = "futureyou.profile";
var DRAFT_STORAGE_KEY = "futureyou.setupDraft";
function emptyProfile() {
	return {
		firstName: "",
		incomeType: "",
		incomeLow: "",
		incomeTypical: "",
		incomeHigh: "",
		variation: "",
		bills: {
			rent: {
				amount: "",
				day: ""
			},
			energy: {
				amount: "",
				day: ""
			},
			wifi: {
				amount: "",
				day: ""
			},
			phone: {
				amount: "",
				day: ""
			},
			other: {
				amount: "",
				day: ""
			}
		},
		monthlyTransport: "",
		weeklyFood: "",
		monthlyRemittance: "",
		currentBalance: ""
	};
}
function readStored(key) {
	if (typeof window === "undefined") return null;
	try {
		return JSON.parse(window.localStorage.getItem(key) ?? "null");
	} catch {
		return null;
	}
}
function loadProfile() {
	const value = readStored(PROFILE_STORAGE_KEY);
	if (value?.version !== 1) return null;
	if (value.source === "personal") return {
		...value,
		profile: {
			...emptyProfile(),
			...value.profile
		}
	};
	return value.source === "adam" ? value : null;
}
function loadDraft() {
	const value = readStored(DRAFT_STORAGE_KEY);
	return value?.profile?.bills && Number.isInteger(value.step) && value.step >= 0 && value.step < 7 ? {
		step: value.step,
		profile: {
			...emptyProfile(),
			...value.profile
		}
	} : null;
}
function saveDraft(profile, step) {
	window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
		profile,
		step
	}));
}
function saveProfile(profile) {
	window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
		version: 1,
		source: "personal",
		profile
	}));
	window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}
function useAdamProfile() {
	window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
		version: 1,
		source: "adam",
		data: adam_default
	}));
	window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}
var isAmount = (value, optional = false) => optional && value.trim() === "" || value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
function validateStep(profile, step) {
	if (step === 0) return profile.firstName.trim() ? null : "nameRequired";
	if (step === 1) {
		if (!profile.incomeType || !profile.variation) return "incomeRequired";
		if (profile.incomeLow === "" || profile.incomeTypical === "" || profile.incomeHigh === "") return "incomeRangeRequired";
		const income = resolveIncome(profile);
		if (!income) return "incomeAllUnsure";
		return income.low <= income.typical && income.typical <= income.high ? null : "incomeOrderError";
	}
	if (step === 2) {
		for (const key of billKeys) {
			const bill = profile.bills[key];
			if (!isAmount(bill.amount, true)) return "amountError";
			if ((Number(bill.amount) > 0 || bill.day !== "") && (!/^\d+$/.test(bill.day) || Number(bill.day) < 1 || Number(bill.day) > 31)) return "dayError";
		}
		return null;
	}
	if (step === 3) return isAmount(profile.monthlyTransport) ? null : "amountError";
	if (step === 4) return isAmount(profile.weeklyFood) ? null : "amountError";
	if (step === 5) return isAmount(profile.monthlyRemittance, true) ? null : "amountError";
	if (step === 6) return profile.currentBalance.trim() !== "" && Number.isFinite(Number(profile.currentBalance)) ? null : "balanceError";
	return null;
}
var ranges = (under, step, top) => {
	const list = [{
		id: `u${under}`,
		min: null,
		max: under
	}];
	for (let v = under; v < top; v += step) list.push({
		id: `${v}`,
		min: v,
		max: v + step
	});
	list.push({
		id: `o${top}`,
		min: top,
		max: null
	});
	return list;
};
var incomeRanges = {
	incomeLow: ranges(100, 50, 300),
	incomeTypical: ranges(150, 50, 400),
	incomeHigh: ranges(250, 50, 500)
};
/** Stored value for a range: midpoint; "Under £X" = X − 25; "£X or more" = X + 50. */
function rangeValue(range) {
	if (range.min === null) return range.max - 25;
	if (range.max === null) return range.min + 50;
	return (range.min + range.max) / 2;
}
var round5 = (n) => Math.round(n / 5) * 5;
/** Fills "Not sure" values from the others. Returns null when nothing is known. */
function resolveIncome(p) {
	const num = (v) => typeof v === "number" ? v : null;
	let low = num(p.incomeLow), typical = num(p.incomeTypical), high = num(p.incomeHigh);
	if (low === null && typical === null && high === null) return null;
	const estimated = {
		low: low === null,
		typical: typical === null,
		high: high === null
	};
	if (typical === null) typical = low !== null && high !== null ? round5((low + high) / 2) : low !== null ? round5(low * 1.5) : round5(high * .65);
	if (low === null) low = high !== null && estimated.typical === false ? round5(Math.min(typical * .6, typical - (high - typical))) : round5(typical * .6);
	if (high === null) high = round5(typical * 1.5);
	low = Math.max(0, low);
	return {
		low,
		typical,
		high,
		estimated
	};
}
//#endregion
export { emptyProfile as a, loadProfile as c, saveDraft as d, saveProfile as f, billKeys as i, rangeValue as l, validateStep as m, MoneyModeToggle as n, incomeRanges as o, useAdamProfile as p, adam_default as r, loadDraft as s, Money as t, resolveIncome as u };
