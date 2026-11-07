import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useLanguage, t as Button } from "./button-CjzHUPf3.mjs";
import { i as saveCurrency, n as currencies, t as AppHeader } from "./currency-BVmo3hFw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/currency-DlUaef4G.js
var import_jsx_runtime = require_jsx_runtime();
function CurrencySelection() {
	const { t } = useLanguage();
	const navigate = useNavigate();
	function choose(currency) {
		saveCurrency(currency);
		navigate({ to: "/setup" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-8 text-3xl font-bold text-secondary",
			children: t("chooseCurrency")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-4 sm:grid-cols-3",
			children: currencies.map((currency) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				dir: "ltr",
				onClick: () => choose(currency),
				className: "h-auto min-h-20 rounded-2xl text-2xl font-bold focus-visible:ring-4",
				children: currency
			}, currency))
		})]
	})] });
}
//#endregion
export { CurrencySelection as component };
