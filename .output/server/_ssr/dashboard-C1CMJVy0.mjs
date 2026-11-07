import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useLanguage, t as Button } from "./button-CjzHUPf3.mjs";
import { t as AppHeader } from "./currency-BVmo3hFw.mjs";
import { c as loadProfile, i as billKeys, n as MoneyModeToggle, t as Money, u as resolveIncome } from "./profile-CejQXid0.mjs";
import { a as ShoppingBasket, b as Bus, c as RefreshCw, l as Play, m as House, o as Send, p as LoaderCircle, s as RotateCcw, u as Pause, v as CalendarPlus, x as Bolt } from "../_libs/lucide-react.mjs";
import { a as loadDemoState, c as resetDemo, d as simulatedForecast, h as useSpeakState, i as demoDate, m as useDemoRevision, o as pauseAudio, p as stopSpeaking, r as buildOutlook, s as playAudio, t as BottomNav, u as simulateNextWeek } from "./speak-D6URt4fr.mjs";
import { d as Cell, f as ResponsiveContainer, t as PieChart, u as Pie } from "../_libs/recharts+[...].mjs";
import { n as SpeakButton, t as Outlook } from "./Outlook-DxkYxDUy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-C1CMJVy0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var future_message_placeholder_default = "/assets/future-message-placeholder-BcJdb5S_.mp3";
async function prepareFutureMessage(risk, language, persona, signal) {
	throw new Error("Message service not configured");
}
function saveRiskAction(risk, action) {
	const key = `futureyou.riskAction.${risk.week}.${action}`;
	const value = {
		week: risk.week,
		action,
		amount: action === "setAside" ? risk.saveWeekly : null,
		weeks: action === "setAside" ? risk.weeksUntil : null
	};
	window.localStorage.setItem(key, JSON.stringify(value));
}
function hasRiskAction(risk, action) {
	return window.localStorage.getItem(`futureyou.riskAction.${risk.week}.${action}`) !== null;
}
function saveCoachRisk(risk) {
	window.localStorage.setItem("futureyou.coachRisk", JSON.stringify(risk));
}
var AUDIO_ID = "future-message";
function FutureMessage() {
	const { t, lang } = useLanguage();
	const revision = useDemoRevision();
	const [data, setData] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("preparing");
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	const [saved, setSaved] = (0, import_react.useState)({
		setAside: false,
		insuranceReminder: false
	});
	const [error, setError] = (0, import_react.useState)(null);
	const audio = useSpeakState();
	const risk = data?.risks[0];
	(0, import_react.useEffect)(() => {
		setData(buildOutlook(loadProfile()));
	}, [revision]);
	(0, import_react.useEffect)(() => {
		if (!data || !risk) return;
		let disposed = false;
		const controller = new AbortController();
		const timeout = window.setTimeout(() => controller.abort(), 2e4);
		setStatus("preparing");
		setMessage(null);
		setError(null);
		try {
			setSaved({
				setAside: hasRiskAction(risk, "setAside"),
				insuranceReminder: hasRiskAction(risk, "insuranceReminder")
			});
		} catch {}
		prepareFutureMessage(risk, lang, data.persona, controller.signal).then((result) => {
			if (!controller.signal.aborted) {
				setMessage(result);
				setStatus("ready");
			}
		}).catch(() => {
			if (!disposed) setStatus("fallback");
		}).finally(() => window.clearTimeout(timeout));
		return () => {
			disposed = true;
			controller.abort();
			window.clearTimeout(timeout);
			stopSpeaking();
		};
	}, [
		data,
		risk,
		lang,
		attempt
	]);
	if (!data || !risk) return null;
	const playing = audio.id === AUDIO_ID && audio.status === "playing";
	const loading = status === "preparing" || audio.id === AUDIO_ID && audio.status === "loading";
	const date = new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", {
		day: "numeric",
		month: "short",
		timeZone: "UTC"
	}).format(/* @__PURE__ */ new Date(`${risk.week}T00:00:00Z`));
	const billNames = risk.bills.map((name) => name === "Rent" ? t("rent") : name === "Car insurance (annual)" ? t("outlookInsurance") : name === "Phone" ? t("phone") : name === "Money sent home" ? t("moneyHome") : t("catBills")).join(` ${t("outlookAnd")} `);
	const reason = billNames ? t("futureReasonBills").replace("{bills}", billNames) : t("futureReasonLow");
	const fallbackParts = t("futureFallback").split(/(\{week\}|\{reason\}|\{shortfall\}|\{fix\})/);
	const action = (key) => {
		try {
			saveRiskAction(risk, key);
			setSaved((previous) => ({
				...previous,
				[key]: true
			}));
			setError(null);
		} catch {
			setError("futureSaveError");
		}
	};
	const play = async () => {
		if (playing) {
			pauseAudio(AUDIO_ID);
			return;
		}
		setError(null);
		try {
			await playAudio(message ? "data:audio/mpeg;base64," + message.audio : future_message_placeholder_default, AUDIO_ID);
		} catch {
			setError("futureAudioError");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "future-message-title",
		className: "rounded-3xl border border-primary/30 bg-card p-5 shadow-sm sm:p-6",
		children: [
			loadDemoState().changed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mb-3 border-s-4 border-accent ps-3 text-lg font-bold text-primary",
				children: t("futureChanged")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "future-message-title",
				className: "mb-4 text-xl font-bold text-secondary",
				children: t("futureTitle")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: play,
					disabled: loading,
					"aria-label": playing ? t("futurePause") : t("futurePlay"),
					className: "size-16 shrink-0 rounded-full p-0 [&_svg]:size-7",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "animate-spin motion-reduce:animate-none",
						"aria-hidden": true
					}) : playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { "aria-hidden": true }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { "aria-hidden": true })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-bold text-secondary",
						children: t("futureSender")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("progress", {
						"aria-label": t("futureProgress"),
						value: audio.id === AUDIO_ID ? audio.progress ?? 0 : 0,
						max: 1,
						className: "future-audio-progress mt-2 h-2 w-full"
					})]
				})]
			}),
			status === "preparing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-4 text-lg",
				children: t("futurePreparing")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [status === "fallback" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "text-lg text-muted-foreground",
						children: t("futureError")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => setAttempt((value) => value + 1),
						className: "min-h-12 text-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { "aria-hidden": true }), t("retry")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base text-muted-foreground",
						children: t("futurePlaceholder")
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-lg leading-relaxed",
				children: message ? message.text : fallbackParts.map((part, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: part === "{week}" ? date : part === "{reason}" ? reason : part === "{shortfall}" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: risk.shortfall }) : part === "{fix}" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					t("outlookSave"),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: risk.saveWeekly }),
					" ",
					t("outlookWeeklyFor"),
					" ",
					risk.weeksUntil,
					" ",
					t("outlookWeeks")
				] }) : part }, i))
			})] }),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-lg text-destructive",
				children: t(error)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => action("setAside"),
						disabled: saved.setAside,
						className: "h-auto min-h-14 whitespace-normal px-4 py-3 text-lg",
						children: saved.setAside ? t("futurePlanSaved") : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							t("futureSetAside"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: risk.saveWeekly }),
							" ",
							t("futureGoodWeeks")
						] })
					}),
					saved.setAside && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "text-base text-muted-foreground",
						children: t("futurePlanNote")
					}),
					risk.bills.some((name) => name.toLowerCase().includes("insurance")) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => action("insuranceReminder"),
						disabled: saved.insuranceReminder,
						className: "h-auto min-h-14 whitespace-normal px-4 py-3 text-lg",
						children: t(saved.insuranceReminder ? "futureReminderSaved" : "futureInsurance")
					}), saved.insuranceReminder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "text-base text-muted-foreground",
						children: t("futureReminderNote")
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "min-h-14 text-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/coach",
							onClick: (event) => {
								try {
									saveCoachRisk(risk);
								} catch {
									event.preventDefault();
									setError("futureSaveError");
								}
							},
							children: t("futureTalk")
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-base text-muted-foreground",
				children: t("futureDisclaimer")
			})
		]
	});
}
function DemoControls() {
	const { t, lang } = useLanguage();
	const revision = useDemoRevision();
	const [isDemo, setIsDemo] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setIsDemo(loadProfile()?.source === "adam");
	}, []);
	if (!isDemo) return null;
	const state = loadDemoState();
	const run = (reset) => {
		try {
			if (reset) resetDemo();
			else {
				const saved = loadProfile();
				if (saved?.source === "adam") simulateNextWeek(saved.data);
			}
			setError(false);
		} catch {
			setError(true);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": t("demoControl"),
		className: "space-y-3 border-y border-border py-4",
		"data-revision": revision,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-base font-bold text-muted-foreground",
				children: [
					t("demoControl"),
					" · ",
					new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", {
						day: "numeric",
						month: "short",
						timeZone: "UTC"
					}).format(/* @__PURE__ */ new Date(`${demoDate(state)}T00:00:00Z`))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => run(false),
					className: "min-h-14 text-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { "aria-hidden": true }), t("simulateNextWeek")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => run(true),
					className: "min-h-14 text-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": true }), t("resetDemo")]
				})]
			}),
			state.weeks > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-lg",
				children: [
					t("demoRentChange"),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: state.rentIncrease }),
					" · ",
					t("demoProjectedTotals")
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-lg text-destructive",
				children: t("futureSaveError")
			})
		]
	});
}
var WEEKS_PER_MONTH = 52 / 12;
/** Small, fixed wobble so mock figures look like a real month rather than exact multiples. */
var MOCK_VARIATION = {
	income: .97,
	food: 1.04,
	transport: .96
};
var categoryKeys = [
	"catRent",
	"catFood",
	"catTransport",
	"catBills",
	"catHome"
];
var round = (n) => Math.round(n * 100) / 100;
var num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
/** Maps the demo persona's transaction categories to dashboard categories. */
var personaCategory = {
	Rent: "catRent",
	Groceries: "catFood",
	"Eating out": "catFood",
	Transport: "catTransport",
	"Money sent home": "catHome"
};
function finish(name, balance, income, totals, estimated) {
	const categories = categoryKeys.map((key) => ({
		key,
		amount: round(totals[key])
	}));
	return {
		name,
		balance: round(balance),
		income: round(income),
		spending: round(categories.reduce((t, c) => t + c.amount, 0)),
		categories,
		estimated
	};
}
function buildDashboard(saved) {
	const totals = {
		catRent: 0,
		catFood: 0,
		catTransport: 0,
		catBills: 0,
		catHome: 0
	};
	if (saved.source === "adam") {
		if (loadDemoState().weeks > 0) {
			const f = simulatedForecast(saved.data);
			for (const day of f.days.slice(0, 30)) for (const event of day.events) if (event.amount < 0) totals[personaCategory[event.name] ?? "catBills"] += -event.amount;
			return finish(f.persona.name, f.currentBalance, f.days.slice(0, 30).flatMap((day) => day.events).filter((event) => event.amount > 0).reduce((sum, event) => sum + event.amount, 0), totals, true);
		}
		const { persona, transactions } = saved.data;
		const month = persona.today.slice(0, 7);
		let income = 0;
		for (const tx of transactions) {
			if (tx.date > persona.today) continue;
			if (!tx.date.startsWith(month)) continue;
			if (tx.amount > 0) income += tx.amount;
			else totals[personaCategory[tx.category] ?? "catBills"] += -tx.amount;
		}
		const balance = persona.startBalance + transactions.filter((tx) => tx.date <= persona.today).reduce((t, tx) => t + tx.amount, 0);
		return finish(persona.name, balance, income, totals, false);
	}
	const p = saved.profile;
	const typical = resolveIncome(p)?.typical ?? 0;
	totals.catRent = num(p.bills.rent.amount);
	totals.catBills = billKeys.filter((k) => k !== "rent").reduce((t, k) => t + num(p.bills[k].amount), 0);
	totals.catFood = num(p.weeklyFood) * WEEKS_PER_MONTH * MOCK_VARIATION.food;
	totals.catTransport = num(p.monthlyTransport) * MOCK_VARIATION.transport;
	totals.catHome = num(p.monthlyRemittance);
	return finish(p.firstName, num(p.currentBalance), typical * WEEKS_PER_MONTH * MOCK_VARIATION.income, totals, true);
}
var categoryStyle = {
	catRent: {
		icon: House,
		color: "var(--chart-1)"
	},
	catFood: {
		icon: ShoppingBasket,
		color: "var(--chart-2)"
	},
	catTransport: {
		icon: Bus,
		color: "var(--chart-3)"
	},
	catBills: {
		icon: Bolt,
		color: "var(--chart-4)"
	},
	catHome: {
		icon: Send,
		color: "var(--chart-5)"
	}
};
function Dashboard() {
	const { t } = useLanguage();
	const revision = useDemoRevision();
	const [data, setData] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		const saved = loadProfile();
		setData(saved ? buildDashboard(saved) : null);
	}, [revision]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-xl space-y-6 px-4 pb-28 pt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					id: "future-you-message",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FutureMessage, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyModeToggle, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoControls, {}),
				data === null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl border border-border bg-card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl font-bold text-secondary",
							children: t("dashboardTitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-lg",
							children: t("noProfile")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-6 min-h-14 rounded-2xl text-lg font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/setup",
								children: t("startSetup")
							})
						})
					]
				}),
				data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardBody, { data })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {})
	] });
}
function DashboardBody({ data }) {
	const { t } = useLanguage();
	const total = data.spending || 1;
	const say = (n) => `${Math.round(n * 100) / 100} ${t("poundsWord")}`;
	const fill = (k, v) => Object.entries(v).reduce((a, [x, y]) => a.replace(`{${x}}`, y), t(k));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "text-3xl font-bold text-secondary",
			children: [
				t("greeting"),
				", ",
				data.name
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-3xl bg-secondary p-6 text-secondary-foreground shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-bold opacity-90",
					children: t("currentBalance")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, {
					id: "balance",
					label: t("currentBalance"),
					text: fill("sayBalance", { amount: say(data.balance) }),
					inverted: true
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-4xl font-bold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: data.balance })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-border bg-card p-6 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-muted-foreground",
						children: t("incomeThisMonth")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, {
						id: "income",
						label: t("incomeThisMonth"),
						text: fill("sayIncome", { amount: say(data.income) })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-3xl font-bold text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: data.income })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-border bg-card p-6 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-muted-foreground",
						children: t("spendingThisMonth")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, {
						id: "spending",
						label: t("spendingThisMonth"),
						text: fill("saySpending", { amount: say(data.spending) })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-3xl font-bold text-secondary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: data.spending })
				})]
			})]
		}),
		data.estimated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-base text-muted-foreground",
			children: t(loadDemoState().weeks > 0 ? "demoProjectedTotals" : "estimateNotice")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-labelledby": "split-heading",
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "split-heading",
					className: "text-2xl font-bold text-secondary",
					children: t("spendingSplit")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-3xl border border-border bg-card p-4 shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "img",
						"aria-label": t("spendingChartLabel"),
						className: "relative mx-auto h-56 w-56",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PieChart, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: data.categories,
								dataKey: "amount",
								nameKey: "key",
								innerRadius: "62%",
								outerRadius: "100%",
								paddingAngle: 2,
								stroke: "none",
								isAnimationActive: false,
								children: data.categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: categoryStyle[c.key].color }, c.key))
							}) })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center text-2xl font-bold text-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: data.spending })
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: data.categories.map((c) => {
						const { icon: Icon, color } = categoryStyle[c.key];
						const pct = Math.round(c.amount / total * 100);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-2xl border border-border bg-card p-4 shadow-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										"aria-hidden": true,
										className: "size-6"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-lg font-bold",
												children: t(c.key)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xl font-bold",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: c.amount })
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 h-3 overflow-hidden rounded-full bg-muted",
											role: "progressbar",
											"aria-label": t(c.key),
											"aria-valuemin": 0,
											"aria-valuemax": 100,
											"aria-valuenow": pct,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full rounded-full",
												style: {
													width: `${pct}%`,
													backgroundColor: color
												}
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-base text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
														dir: "ltr",
														children: [pct, "%"]
													}),
													" ",
													t("ofSpending")
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, {
												id: c.key,
												label: t(c.key),
												text: fill("sayCategory", {
													category: t(c.key),
													amount: say(c.amount),
													pct: String(pct)
												})
											})]
										})
									]
								})]
							})
						}, c.key);
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlook, { compact: true }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-3xl border border-dashed border-border bg-card p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-bold text-secondary",
				children: t("coachTitle")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-lg text-muted-foreground",
				children: t("coachSoon")
			})]
		})
	] });
}
//#endregion
export { Dashboard as component };
