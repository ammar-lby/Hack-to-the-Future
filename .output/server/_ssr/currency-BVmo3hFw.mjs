import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as languageOptions, o as useLanguage } from "./button-CjzHUPf3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/currency-BVmo3hFw.js
var import_jsx_runtime = require_jsx_runtime();
function AppHeader() {
	const { lang, setLang, t } = useLanguage();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-10 border-b border-border bg-card",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/dashboard",
				className: "text-xl font-bold text-secondary",
				children: t("appName")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				"aria-label": t("language"),
				value: lang,
				onChange: (event) => setLang(event.target.value),
				className: "min-h-12 max-w-40 rounded-xl border-2 border-secondary bg-card px-3 text-lg font-bold text-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
				children: languageOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: option.value,
					lang: option.value,
					children: t(option.labelKey)
				}, option.value))
			})]
		})
	});
}
var currencies = [
	"INR",
	"PKR",
	"BDT",
	"EGP",
	"NGN",
	"PHP",
	"LYD",
	"PLN",
	"USD",
	"EUR",
	"GBP",
	"AED",
	"SAR",
	"CAD"
];
var CURRENCY_STORAGE_KEY = "futureyou.currency";
function saveCurrency(currency) {
	window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}
function loadCurrency() {
	if (typeof window === "undefined") return null;
	const value = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
	return currencies.find((currency) => currency === value) ?? null;
}
//#endregion
export { saveCurrency as i, currencies as n, loadCurrency as r, AppHeader as t };
