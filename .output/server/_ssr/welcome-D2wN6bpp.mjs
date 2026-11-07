import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as languageOptions, o as useLanguage, t as Button } from "./button-CjzHUPf3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/welcome-D2wN6bpp.js
var import_jsx_runtime = require_jsx_runtime();
function Welcome() {
	const { setLang, t } = useLanguage();
	const navigate = useNavigate();
	const choose = (l) => {
		setLang(l);
		navigate({ to: "/currency" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		lang: "en",
		dir: "ltr",
		className: "mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-8 px-6 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-hidden": true,
					className: "mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-primary text-4xl text-primary-foreground",
					children: "✦"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-5xl font-bold text-secondary",
					children: t("appName", "en")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-xl text-foreground",
					children: t("tagline", "en")
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-5 text-center text-xl font-bold",
			children: t("chooseLanguage", "en")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-4",
			children: languageOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				lang: option.value,
				dir: option.value === "ar" || option.value === "ur" ? "rtl" : "ltr",
				onClick: () => choose(option.value),
				variant: option.value === "en" ? "default" : "outline",
				className: "h-auto min-h-20 rounded-2xl px-6 py-4 text-2xl font-bold focus-visible:ring-4",
				children: t(option.labelKey)
			}, option.value))
		})] })]
	});
}
//#endregion
export { Welcome as component };
