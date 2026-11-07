import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useLanguage, r as cn, t as Button } from "./button-CjzHUPf3.mjs";
import { t as AppHeader } from "./currency-BVmo3hFw.mjs";
import { a as emptyProfile, c as loadProfile, d as saveDraft, f as saveProfile, i as billKeys, l as rangeValue, m as validateStep, o as incomeRanges, p as useAdamProfile, s as loadDraft, t as Money, u as resolveIncome } from "./profile-CejQXid0.mjs";
import { C as ArrowRight, g as Check, i as Sparkles, w as ArrowLeft } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/setup-P-XJi0c1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var titles = [
	"aboutYou",
	"income",
	"mainBills",
	"transport",
	"food",
	"moneyHome",
	"currentBalance"
];
var incomeTypes = [
	"weeklyGig",
	"shiftWork",
	"zeroHours",
	"other"
];
var variations = [
	"steady",
	"variesBit",
	"variesLot"
];
function ProfileSetup() {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [profile, setProfile] = (0, import_react.useState)(emptyProfile);
	const [step, setStep] = (0, import_react.useState)(0);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const heading = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const draft = loadDraft();
		const saved = loadProfile();
		if (draft) {
			setProfile(draft.profile);
			setStep(draft.step);
		} else if (saved?.source === "personal") setProfile(saved.profile);
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready || step === 7) return;
		try {
			saveDraft(profile, step);
		} catch {
			setError("saveError");
		}
	}, [
		profile,
		step,
		ready
	]);
	(0, import_react.useEffect)(() => {
		if (ready) heading.current?.focus();
	}, [step, ready]);
	function update(key, value) {
		setError(null);
		setProfile((previous) => ({
			...previous,
			[key]: value
		}));
	}
	function next(event) {
		event.preventDefault();
		const validation = validateStep(profile, step);
		if (validation) {
			setError(validation);
			return;
		}
		try {
			if (step === 6) saveProfile({
				...profile,
				firstName: profile.firstName.trim()
			});
			else saveDraft(profile, step + 1);
			setError(null);
			setStep(step + 1);
		} catch {
			setError("saveError");
		}
	}
	function demo() {
		try {
			useAdamProfile();
			navigate({ to: "/dashboard" });
		} catch {
			setError("saveError");
		}
	}
	function amount(key, label, optional = false) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: key,
				className: "block text-lg font-bold",
				children: t(label)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: key,
				name: key,
				type: "number",
				inputMode: "decimal",
				step: "0.01",
				min: key === "currentBalance" ? void 0 : 0,
				required: !optional,
				value: profile[key],
				onChange: (event) => update(key, event.target.value),
				className: "h-16 rounded-2xl bg-card px-5 text-xl md:text-xl focus-visible:ring-4"
			})]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-lg font-bold text-muted-foreground",
					children: [
						t("step"),
						" ",
						Math.min(step + 1, 7),
						" ",
						t("of"),
						" 7"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "progressbar",
					"aria-label": t("setupTitle"),
					"aria-valuemin": 0,
					"aria-valuemax": 7,
					"aria-valuenow": step,
					className: "grid h-3 grid-cols-7 gap-1.5 overflow-hidden rounded-full",
					children: titles.map((title, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: index < step ? "bg-primary" : index === step ? "bg-accent" : "bg-border" }, title))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				ref: heading,
				tabIndex: -1,
				className: "mb-8 text-3xl font-bold text-secondary outline-none",
				children: t(step === 7 ? "allSet" : titles[step] ?? "aboutYou")
			}),
			step === 7 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
				"aria-hidden": true,
				className: "mb-8 size-16 rounded-full bg-primary p-3 text-primary-foreground"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "min-h-16 w-full rounded-2xl bg-accent text-xl font-bold text-accent-foreground hover:bg-accent/90",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard",
					children: [t("goDashboard"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "rtl:rotate-180" })]
				})
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: next,
				noValidate: true,
				className: "space-y-8",
				children: [
					step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "firstName",
							className: "block text-lg font-bold",
							children: t("firstName")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "firstName",
							autoComplete: "given-name",
							value: profile.firstName,
							onChange: (event) => update("firstName", event.target.value),
							className: "h-16 rounded-2xl bg-card px-5 text-xl md:text-xl focus-visible:ring-4"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						onClick: demo,
						className: "h-auto min-h-16 w-full whitespace-normal rounded-2xl bg-accent px-4 py-4 text-xl font-bold text-accent-foreground hover:bg-accent/90",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { "aria-hidden": true }), t("useDemo")]
					})] }),
					step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "mb-3 text-lg font-bold",
							children: t("incomeType")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
							children: incomeTypes.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: profile.incomeType === value ? "default" : "outline",
								"aria-pressed": profile.incomeType === value,
								onClick: () => update("incomeType", value),
								className: "h-auto min-h-16 whitespace-normal rounded-2xl px-4 py-3 text-lg font-bold",
								children: t(value)
							}, value))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IncomeRanges, {
							profile,
							onChange: (key, value) => {
								setError(null);
								setProfile((previous) => ({
									...previous,
									[key]: value
								}));
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "mb-3 text-lg font-bold",
							children: t("incomeVariation")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
							children: variations.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: profile.variation === value ? "default" : "outline",
								"aria-pressed": profile.variation === value,
								onClick: () => update("variation", value),
								className: "h-auto min-h-16 whitespace-normal rounded-2xl px-3 py-3 text-lg font-bold",
								children: t(value)
							}, value))
						})] })
					] }),
					step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border",
						children: billKeys.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "pb-6 pt-4 first:pt-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-xl font-bold text-secondary",
								children: t(key)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: `${key}-amount`,
									className: "mb-2 block text-lg",
									children: t("monthlyAmount")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: `${key}-amount`,
									type: "number",
									inputMode: "decimal",
									min: 0,
									step: "0.01",
									value: profile.bills[key].amount,
									onChange: (event) => {
										setError(null);
										setProfile((previous) => ({
											...previous,
											bills: {
												...previous.bills,
												[key]: {
													...previous.bills[key],
													amount: event.target.value
												}
											}
										}));
									},
									className: "h-16 rounded-2xl bg-card text-xl md:text-xl"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: `${key}-day`,
									className: "mb-2 block text-lg",
									children: t("dueDay")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: `${key}-day`,
									type: "number",
									inputMode: "numeric",
									min: 1,
									max: 31,
									step: 1,
									value: profile.bills[key].day,
									onChange: (event) => {
										setError(null);
										setProfile((previous) => ({
											...previous,
											bills: {
												...previous.bills,
												[key]: {
													...previous.bills[key],
													day: event.target.value
												}
											}
										}));
									},
									className: "h-16 rounded-2xl bg-card text-xl md:text-xl"
								})] })]
							})]
						}, key))
					}),
					step === 3 && amount("monthlyTransport", "monthlyTransport"),
					step === 4 && amount("weeklyFood", "weeklyFood"),
					step === 5 && amount("monthlyRemittance", "monthlyRemittance", true),
					step === 6 && amount("currentBalance", "balanceAmount"),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-lg font-bold text-destructive",
						children: t(error)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-4 border-t border-border pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => {
								setError(null);
								if (step > 0) setStep(step - 1);
								else navigate({ to: "/currency" });
							},
							className: "min-h-16 flex-1 rounded-2xl text-xl font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
								"aria-hidden": true,
								className: "rtl:rotate-180"
							}), t("back")]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							className: "h-auto min-h-16 flex-1 whitespace-normal rounded-2xl text-xl font-bold",
							children: [t(step === 6 ? "finish" : "next"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								"aria-hidden": true,
								className: "rtl:rotate-180"
							})]
						})]
					})
				]
			})
		]
	});
}
var incomeRows = [
	["incomeLow", "lowWeek"],
	["incomeTypical", "typicalWeek"],
	["incomeHigh", "goodWeek"]
];
function IncomeRanges({ profile, onChange }) {
	const { t } = useLanguage();
	const resolved = resolveIncome(profile);
	const answered = incomeRows.every(([key]) => profile[key] !== "");
	const orderBad = answered && resolved && (resolved.low > resolved.typical || resolved.typical > resolved.high);
	const anyEstimated = answered && resolved && Object.values(resolved.estimated).some(Boolean);
	const chip = "h-auto min-h-14 whitespace-normal rounded-full px-4 py-2 text-lg font-bold";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "income-range-q",
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "income-range-q",
				className: "text-xl font-bold text-secondary",
				children: t("takeHomeQuestion")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-lg text-muted-foreground",
				children: t("takeHomeHelper")
			})] }),
			incomeRows.map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
				className: "mb-3 text-lg font-bold",
				children: t(label)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [incomeRanges[key].map((range) => {
					const value = rangeValue(range);
					const selected = profile[key] === value;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: selected ? "default" : "outline",
						"aria-pressed": selected,
						onClick: () => onChange(key, value),
						className: chip,
						children: range.min === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							t("under"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: range.max })
						] }) : range.max === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: range.min }),
							" ",
							t("orMore")
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: range.min }),
							"–",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: range.max })
						] })
					}, range.id);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: profile[key] === null ? "default" : "outline",
					"aria-pressed": profile[key] === null,
					onClick: () => onChange(key, null),
					className: chip,
					children: t("notSure")
				})]
			})] }, key)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"aria-live": "polite",
				className: "space-y-2",
				children: [
					answered && resolved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-2xl bg-muted p-4 text-lg font-bold",
						children: [
							t("rangeFrom"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: resolved.low }),
							" ",
							t("rangeTo"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: resolved.high }),
							" ",
							t("rangeTypical"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: resolved.typical }),
							"."
						]
					}),
					anyEstimated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base text-muted-foreground",
						children: t("estimatedNote")
					}),
					orderBad && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-lg font-bold text-destructive",
						children: t("incomeOrderError")
					})
				]
			})
		]
	});
}
function Setup() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSetup, {})] });
}
//#endregion
export { Setup as component };
