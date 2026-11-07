import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useLanguage } from "./button-CjzHUPf3.mjs";
import { r as adam_default } from "./profile-CejQXid0.mjs";
import { _ as ChartLine, f as MessageCircle, m as House } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/speak-D6URt4fr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEMO_TODAY = "2026-11-15";
var COACH_WEBHOOK_URL = "https://futureyou.app.n8n.cloud/webhook/coach";
function forecast(data, options = {}) {
	const days = options.days || 90;
	const buffer = options.buffer ?? 0;
	const extra = options.extra || [];
	const billChanges = options.billChanges || {};
	const p = data.persona;
	const tx = data.transactions;
	const today = parseDate(p.today);
	const currentBalance = round(tx.reduce((sum, t) => sum + t.amount, p.startBalance));
	const pays = tx.filter((t) => t.type === "income").map((t) => t.amount).sort((a, b) => a - b);
	const income = {
		low: round(percentile(pays, .25)),
		typical: round(percentile(pays, .5)),
		high: round(percentile(pays, .75)),
		weeksOfHistory: pays.length
	};
	const payWeekday = mostCommon(tx.filter((t) => t.type === "income").map((t) => parseDate(t.date).getUTCDay()));
	const historyDays = Math.max(1, daysBetween(parseDate(p.historyStart), today));
	const dailySpend = round(tx.filter((t) => t.type === "spend").reduce((s, t) => s - t.amount, 0) / historyDays);
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
			events.push({
				name: "Pay",
				amount: income.typical,
				lowAmount: income.low
			});
		}
		for (const bill of data.knownBills) if (bill.date ? bill.date === iso : bill.dayOfMonth === date.getUTCDate()) {
			const amount = billChanges[bill.name] ?? bill.amount;
			expected -= amount;
			badCase -= amount;
			events.push({
				name: bill.name,
				amount: -amount
			});
		}
		for (const e of extra) if (e.date === iso) {
			expected -= e.amount;
			badCase -= e.amount;
			events.push({
				name: e.name || "Planned spend",
				amount: -e.amount
			});
		}
		timeline.push({
			date: iso,
			expected: round(expected),
			badCase: round(badCase),
			events
		});
	}
	const byWeek = groupBy(timeline, (d) => toIso(startOfWeek(parseDate(d.date))));
	const riskWeeks = Object.entries(byWeek).map(([week, list]) => ({
		week,
		worst: list.reduce((a, b) => b.badCase < a.badCase ? b : a)
	})).filter((w) => w.worst.badCase < buffer);
	const periods = [];
	for (const w of riskWeeks) {
		const last = periods.at(-1);
		if (last && daysBetween(parseDate(last.weeks.at(-1).week), parseDate(w.week)) <= 28) last.weeks.push(w);
		else periods.push({ weeks: [w] });
	}
	const risks = periods.map(({ weeks }) => {
		const first = weeks[0];
		const worst = weeks.reduce((a, b) => b.worst.badCase < a.worst.badCase ? b : a).worst;
		const shortfall = Math.ceil(buffer - worst.badCase);
		const windowStart = addDays(parseDate(first.week), -3);
		const bills = timeline.filter((d) => parseDate(d.date) >= windowStart && parseDate(d.date) <= parseDate(first.worst.date)).flatMap((d) => d.events.filter((e) => e.amount < 0)).sort((a, b) => a.amount - b.amount);
		const billNames = [...new Set(bills.map((b) => b.name))].slice(0, 2);
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
			weeksUntil
		};
	});
	return {
		persona: {
			name: p.name,
			language: p.language,
			homeCurrency: p.homeCurrency,
			gbpToHome: p.gbpToHome
		},
		today: p.today,
		currentBalance,
		currentBalanceHome: round(currentBalance * (p.gbpToHome || 1)),
		income,
		dailySpend,
		days: timeline,
		risks
	};
}
function parseDate(s) {
	const [y, m, d] = s.split("-").map(Number);
	return new Date(Date.UTC(y, m - 1, d));
}
function toIso(d) {
	return d.toISOString().slice(0, 10);
}
function addDays(d, n) {
	const x = new Date(d);
	x.setUTCDate(x.getUTCDate() + n);
	return x;
}
function daysBetween(a, b) {
	return Math.round((b.getTime() - a.getTime()) / 864e5);
}
function startOfWeek(d) {
	return addDays(d, -((d.getUTCDay() + 6) % 7));
}
function round(n) {
	return Math.round(n * 100) / 100;
}
function percentile(sorted, q) {
	if (!sorted.length) return 0;
	const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
	return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
function mostCommon(arr) {
	const counts = {};
	let best = arr[0];
	for (const v of arr) {
		counts[v] = (counts[v] || 0) + 1;
		if (counts[v] > counts[best]) best = v;
	}
	return best;
}
function groupBy(arr, keyFn) {
	return arr.reduce((acc, x) => {
		const k = keyFn(x);
		(acc[k] = acc[k] || []).push(x);
		return acc;
	}, {});
}
function listText(items) {
	return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}
var DEMO_STATE_KEY = "futureyou.demoState";
var initial = {
	version: 1,
	weeks: 0,
	rentIncrease: 0,
	changed: false
};
var listeners$1 = /* @__PURE__ */ new Set();
var revision = 0;
function loadDemoState() {
	if (typeof window === "undefined") return initial;
	try {
		const value = JSON.parse(window.localStorage.getItem("futureyou.demoState") ?? "null");
		return value?.version === 1 && Number.isInteger(value.weeks) && value.weeks >= 0 && Number.isFinite(value.rentIncrease) && value.rentIncrease >= 0 ? value : initial;
	} catch {
		return initial;
	}
}
function notify() {
	revision++;
	listeners$1.forEach((listener) => listener());
}
function useDemoRevision() {
	return (0, import_react.useSyncExternalStore)((listener) => {
		listeners$1.add(listener);
		window.addEventListener("storage", listener);
		return () => {
			listeners$1.delete(listener);
			window.removeEventListener("storage", listener);
		};
	}, () => revision, () => 0);
}
function demoDate(state) {
	const date = /* @__PURE__ */ new Date(`${DEMO_TODAY}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + state.weeks * 7);
	return date.toISOString().slice(0, 10);
}
/** Demo-only input changes; all balance and risk arithmetic remains in forecast. */
function simulatedForecast(source, state = loadDemoState()) {
	const rent = source.knownBills.find((bill) => bill.name === "Rent");
	return forecast({
		...source,
		persona: {
			...source.persona,
			today: demoDate(state)
		}
	}, { billChanges: rent && state.weeks ? { Rent: rent.amount + state.rentIncrease } : {} });
}
function simulateNextWeek(source) {
	const previous = loadDemoState();
	const state = {
		version: 1,
		weeks: previous.weeks + 1,
		rentIncrease: previous.rentIncrease + 400,
		changed: true
	};
	const result = simulatedForecast(source, state);
	window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
	notify();
	return result;
}
function resetDemo() {
	window.localStorage.removeItem(DEMO_STATE_KEY);
	notify();
}
var items = [
	{
		to: "/dashboard",
		label: "navHome",
		icon: House
	},
	{
		to: "/outlook",
		label: "navOutlook",
		icon: ChartLine
	},
	{
		to: "/coach",
		label: "navCoach",
		icon: MessageCircle
	}
];
function BottomNav() {
	const { t } = useLanguage();
	const revision = useDemoRevision();
	const [changed, setChanged] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setChanged(loadDemoState().changed);
	}, [revision]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": t("appName"),
		className: "fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mx-auto grid max-w-xl grid-cols-3",
			children: items.map(({ to, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to,
				className: "flex min-h-16 flex-col items-center justify-center gap-1 text-base font-bold text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
				activeProps: {
					className: "text-primary",
					"aria-current": "page"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						"aria-hidden": true,
						className: "size-6"
					}), to === "/dashboard" && changed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-label": t("demoNewRisk"),
						className: "absolute -end-2 -top-1 size-3 rounded-full bg-destructive ring-2 ring-card"
					})]
				}), t(label)]
			}) }, to))
		})
	});
}
/** Never fabricate transaction history. Personal profiles without history show a labelled Adam preview. */
function buildOutlook(saved) {
	return simulatedForecast(saved?.source === "adam" ? saved.data : adam_default);
}
function weekOf(iso) {
	const date = /* @__PURE__ */ new Date(`${iso}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
	return date.toISOString().slice(0, 10);
}
function riskWeeks(data) {
	return [...new Set(data.days.filter((day) => day.badCase < 0).map((day) => weekOf(day.date)))];
}
var state = {
	id: null,
	status: "idle"
};
var listeners = /* @__PURE__ */ new Set();
var set = (s) => {
	state = s;
	listeners.forEach((l) => l());
};
var audio = null;
var token = 0;
/** Shared player for received MP3s and bundled audio; invoke only from a click. */
async function playAudio(source, id) {
	if (audio && state.id === id && state.status === "paused") {
		await audio.play();
		set({
			...state,
			status: "playing"
		});
		return;
	}
	stopSpeaking();
	const my = token;
	audio = new Audio(source);
	set({
		id,
		status: "loading",
		progress: 0
	});
	audio.ontimeupdate = () => {
		if (my === token && audio) set({
			...state,
			progress: Number.isFinite(audio.duration) && audio.duration > 0 ? audio.currentTime / audio.duration : 0
		});
	};
	audio.onended = () => {
		if (my === token) set({
			id: null,
			status: "idle"
		});
	};
	audio.onerror = () => {
		if (my === token) stopSpeaking();
	};
	try {
		await audio.play();
		if (my === token) set({
			...state,
			id,
			status: "playing"
		});
	} catch (error) {
		if (my === token) stopSpeaking();
		throw error;
	}
}
function pauseAudio(id) {
	if (state.id !== id || !audio) return;
	audio.pause();
	set({
		...state,
		status: "paused"
	});
}
var voiceLang = {
	en: "en-GB",
	ar: "ar",
	hi: "hi-IN",
	bn: "bn-BD",
	ur: "ur-PK"
};
/** Stop whatever is playing or loading. */
function stopSpeaking() {
	token++;
	if (audio) {
		audio.pause();
		audio.src = "";
		audio = null;
	}
	if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
	set({
		id: null,
		status: "idle"
	});
}
function browserSpeak(text, language, my) {
	if (!("speechSynthesis" in window)) {
		set({
			id: null,
			status: "idle"
		});
		return;
	}
	const u = new SpeechSynthesisUtterance(text);
	u.lang = voiceLang[language];
	const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith(voiceLang[language].slice(0, 2)));
	if (v) u.voice = v;
	u.onend = u.onerror = () => {
		if (my === token) set({
			id: null,
			status: "idle"
		});
	};
	window.speechSynthesis.speak(u);
}
/**
* Read text aloud. Call only from a user click. Only one audio plays at a time.
* Uses the n8n webhook when set, otherwise (or on failure) the browser's voice.
*/
async function speak(text, language, id = "default") {
	stopSpeaking();
	const my = token;
	set({
		id,
		status: "loading"
	});
	set({
		id,
		status: "playing"
	});
	browserSpeak(text, language, my);
}
function useSpeakState() {
	return (0, import_react.useSyncExternalStore)((l) => {
		listeners.add(l);
		return () => listeners.delete(l);
	}, () => state, () => state);
}
//#endregion
export { loadDemoState as a, resetDemo as c, simulatedForecast as d, speak as f, weekOf as g, useSpeakState as h, demoDate as i, riskWeeks as l, useDemoRevision as m, COACH_WEBHOOK_URL as n, pauseAudio as o, stopSpeaking as p, buildOutlook as r, playAudio as s, BottomNav as t, simulateNextWeek as u };
