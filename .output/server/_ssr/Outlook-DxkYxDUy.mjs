import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as dirFor, o as useLanguage, r as cn, t as Button } from "./button-CjzHUPf3.mjs";
import { c as loadProfile, t as Money } from "./profile-CejQXid0.mjs";
import { S as ArrowUpRight, h as CircleCheck, n as TriangleAlert, p as LoaderCircle, r as Square, t as Volume2, y as CalendarDays } from "../_libs/lucide-react.mjs";
import { f as speak, g as weekOf, h as useSpeakState, l as riskWeeks, m as useDemoRevision, p as stopSpeaking, r as buildOutlook } from "./speak-D6URt4fr.mjs";
import { a as Line, c as ReferenceDot, f as ResponsiveContainer, i as XAxis, l as ReferenceLine, n as LineChart, o as CartesianGrid, r as YAxis, s as ReferenceArea } from "../_libs/recharts+[...].mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Outlook-DxkYxDUy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Large speaker button that reads `text` aloud in the chosen language. */
function SpeakButton({ id, text, label, inverted }) {
	const { t, lang } = useLanguage();
	const s = useSpeakState();
	const active = s.id === id ? s.status : "idle";
	const onClick = () => active === "idle" ? speak(text, lang, id) : stopSpeaking();
	const Icon = active === "loading" ? LoaderCircle : active === "playing" ? Square : Volume2;
	const word = active === "loading" ? t("loadingAudio") : active === "playing" ? t("stopAudio") : t("listen");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		"aria-label": active === "idle" ? `${t("listenTo")} ${label}` : word,
		"aria-busy": active === "loading",
		className: cn("inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-base font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring", inverted ? "border-secondary-foreground/60 text-secondary-foreground" : "border-secondary text-secondary", active !== "idle" && (inverted ? "bg-secondary-foreground text-secondary" : "bg-secondary text-secondary-foreground")),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			"aria-hidden": true,
			className: cn("size-5", active === "loading" && "animate-spin")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-live": "polite",
			children: word
		})]
	});
}
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })]
}));
Slider.displayName = Slider$1.displayName;
var eventKeys = {
	Pay: "outlookPay",
	Rent: "rent",
	Phone: "phone",
	"Money sent home": "moneyHome",
	"Car insurance (annual)": "outlookInsurance",
	"Planned spend": "outlookPlanned"
};
function Outlook({ compact = false }) {
	const { t, lang } = useLanguage();
	const revision = useDemoRevision();
	const [state, setState] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const saved = loadProfile();
		setState({
			data: buildOutlook(saved),
			demo: saved?.source !== "adam"
		});
	}, [revision]);
	const [index, setIndex] = (0, import_react.useState)(20);
	const formatDate = (iso) => new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", {
		day: "numeric",
		month: "short",
		timeZone: "UTC"
	}).format(/* @__PURE__ */ new Date(`${iso}T00:00:00Z`));
	const eventName = (name) => t(eventKeys[name] ?? "catBills");
	const chartDays = (0, import_react.useMemo)(() => state?.data.days.map((day, i) => ({
		...day,
		index: i
	})), [state]);
	if (!state || !chartDays) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "status",
		children: t("outlookLoading")
	});
	const { data } = state;
	const selected = data.days[index];
	if (!selected) return null;
	const weeks = riskWeeks(data);
	const isRisk = weeks.includes(weekOf(selected.date));
	const events = data.days.flatMap((day, i) => day.events.map((event) => ({
		...event,
		date: day.date,
		index: i,
		expected: day.expected
	})));
	const nearbyBills = events.filter((event) => event.amount < 0 && Math.abs(event.index - index) <= 3);
	const risk = data.risks[0];
	const reasons = risk?.bills.map(eventName).join(` ${t("outlookAnd")} `);
	const speech = risk ? `${t("outlookWeekOf")} ${formatDate(risk.week)}: ${reasons ? `${reasons} ${t("outlookTogether")}` : t("outlookLowIncome")} ${risk.shortfall} ${t("poundsWord")} ${t("outlookShort")} ${t("outlookSave")} ${risk.saveWeekly} ${t("poundsWord")} ${t("outlookWeeklyFor")} ${risk.weeksUntil} ${t("outlookWeeks")}.` : t("outlookNoRisk");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": t("outlookTitle"),
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold text-secondary",
					children: t("outlookTitle")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold text-secondary",
					children: t("outlookTitle")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-base text-muted-foreground",
					children: [
						t("outlookAsOf"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", { children: formatDate(data.today) })
					]
				})]
			}),
			state.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-lg text-muted-foreground",
				children: t("outlookDemoNotice")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-x-6 gap-y-2 text-lg font-bold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-8 border-t-[3px] border-primary" }), t("outlookExpected")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-8 border-t-[3px] border-dashed border-secondary" }), t("outlookBadWeeks")]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				dir: "ltr",
				role: "img",
				"aria-label": t("outlookChart"),
				className: compact ? "h-64 w-full min-w-0" : "h-80 w-full min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: chartDays,
						margin: {
							top: 20,
							right: 12,
							left: 4,
							bottom: 4
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								vertical: false,
								stroke: "var(--border)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								reversed: dirFor(lang) === "rtl",
								type: "number",
								dataKey: "index",
								domain: [0, 89],
								ticks: [
									0,
									29,
									59,
									89
								],
								tickFormatter: (i) => formatDate(data.days[i]?.date ?? data.today),
								tick: {
									fill: "var(--muted-foreground)",
									fontSize: 14
								},
								tickLine: false,
								axisLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								width: 78,
								tickCount: 4,
								axisLine: false,
								tickLine: false,
								tick: ({ x, y, payload }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("foreignObject", {
									x: Number(x) - 77,
									y: Number(y) - 20,
									width: 75,
									height: 44,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-end text-sm text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: Number(payload.value) })
									})
								}) })
							}),
							weeks.map((week) => {
								const indices = chartDays.filter((day) => weekOf(day.date) === week).map((day) => day.index);
								const first = indices[0], last = indices[indices.length - 1];
								if (first === void 0 || last === void 0) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceArea, {
									x1: first,
									x2: last,
									fill: "var(--destructive)",
									fillOpacity: .12,
									strokeOpacity: 0
								}, week);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
								y: 0,
								stroke: "var(--destructive)",
								strokeDasharray: "3 4"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "linear",
								dataKey: "expected",
								stroke: "var(--primary)",
								strokeWidth: 3,
								dot: false,
								isAnimationActive: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "linear",
								dataKey: "badCase",
								stroke: "var(--secondary)",
								strokeWidth: 3,
								strokeDasharray: "7 5",
								dot: false,
								isAnimationActive: false
							}),
							events.map((event, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceDot, {
								x: event.index,
								y: event.expected,
								r: event.amount > 0 ? 3 : 4,
								fill: event.amount > 0 ? "var(--primary)" : "var(--card)",
								stroke: "var(--secondary)"
							}, i)),
							!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
								x: index,
								stroke: "var(--muted-foreground)",
								strokeDasharray: "2 3"
							})
						]
					})
				})
			}),
			risk && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 text-lg font-bold text-destructive",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
						className: "size-5",
						"aria-hidden": true
					}),
					t("outlookWeekOf"),
					" ",
					formatDate(risk.week),
					" · ",
					t("outlookShortfall"),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: risk.shortfall })
				]
			}),
			!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-lg font-bold text-secondary",
				children: t("outlookTimeline")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-3",
				"aria-label": t("outlookTimeline"),
				children: events.map((event, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => setIndex(event.index),
					className: "h-auto min-h-16 shrink-0 flex-col items-start gap-0 rounded-lg px-3 py-2 text-base",
					"aria-pressed": index === event.index,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: formatDate(event.date)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: eventName(event.name) })]
				}, i))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-y border-border py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							id: "look-ahead",
							className: "text-xl font-bold text-secondary",
							children: t("outlookExplore")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: (index + 1) % 7 === 0 ? t("outlookWeeksAhead").replace("{weeks}", String((index + 1) / 7)) : t("outlookDaysAhead").replace("{days}", String(index + 1)) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						dir: dirFor(lang),
						"aria-labelledby": "look-ahead",
						"aria-valuetext": formatDate(selected.date),
						min: 0,
						max: 89,
						step: 1,
						value: [index],
						onValueChange: (value) => {
							if (value[0] !== void 0) setIndex(value[0]);
						},
						className: "my-3 min-h-12 [&_[role=slider]]:size-7 [&_[role=slider]]:border-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						"aria-live": "polite",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "flex items-center gap-2 text-xl font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
										className: "size-5",
										"aria-hidden": true
									}), formatDate(selected.date)]
								}), isRisk && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-base font-bold text-destructive",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
										className: "size-4",
										"aria-hidden": true
									}), t("outlookRiskBadge")]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-lg text-muted-foreground",
									children: t("outlookExpected")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-2xl font-bold text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: selected.expected })
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-lg text-muted-foreground",
									children: t("outlookBadWeeks")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: isRisk ? "text-2xl font-bold text-destructive" : "text-2xl font-bold text-secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: selected.badCase })
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-lg font-bold",
								children: t("outlookAround")
							}),
							nearbyBills.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2",
								children: nearbyBills.map((bill, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										eventName(bill.name),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-base text-muted-foreground",
											children: ["· ", formatDate(bill.date)]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, {
										amount: -bill.amount,
										className: "font-bold"
									})]
								}, i))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-lg text-muted-foreground",
								children: t("outlookNoBills")
							})
						]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 border-s-4 border-primary ps-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-bold text-secondary",
						children: risk ? t("outlookNextRisk") : t("outlookTitle")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, {
						id: compact ? "outlook-preview" : "outlook-summary",
						text: speech,
						label: t("outlookNextRisk")
					})]
				}), risk ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-lg leading-relaxed",
					children: [
						t("outlookWeekOf"),
						" ",
						formatDate(risk.week),
						": ",
						reasons ? `${reasons} ${t("outlookTogether")}` : t("outlookLowIncome"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, {
							amount: risk.shortfall,
							className: "font-bold"
						}),
						" ",
						t("outlookShort")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold",
							children: [t("outlookFix"), ": "]
						}),
						t("outlookSave"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, {
							amount: risk.saveWeekly,
							className: "font-bold"
						}),
						" ",
						t("outlookWeeklyFor"),
						" ",
						risk.weeksUntil,
						" ",
						t("outlookWeeks"),
						"."
					]
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-start gap-2 text-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
						className: "mt-1 size-6 shrink-0 text-primary",
						"aria-hidden": true
					}), t("outlookNoRisk")]
				})]
			}),
			compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				className: "min-h-14 w-full text-lg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/outlook",
					children: [t("outlookOpen"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { "aria-hidden": true })]
				})
			})
		]
	});
}
//#endregion
export { SpeakButton as n, Outlook as t };
