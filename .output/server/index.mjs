globalThis.__nitro_main__ = import.meta.url;
import { n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-11-07T14:56:58.996Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-11-07T14:56:58.996Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/Outlook-DaDIxDmz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"65184-ZBavi5AfVYsmtasmN5EHPSAstQ8\"",
		"mtime": "2026-11-07T14:56:58.464Z",
		"size": 414084,
		"path": "../public/assets/Outlook-DaDIxDmz.js"
	},
	"/assets/button-MXjjocVD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1030d-ifYxuR9AahyJ83uvbmGhC58rkCY\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 66317,
		"path": "../public/assets/button-MXjjocVD.js"
	},
	"/assets/coach-xOZUSJE2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ea2-GrHsg4PGMxhdwALxVycmeq52XIM\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 7842,
		"path": "../public/assets/coach-xOZUSJE2.js"
	},
	"/assets/currency-B8wfJ1cW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c9-ydB8d6bUhVcldvuKOQSWrEhcQLw\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 713,
		"path": "../public/assets/currency-B8wfJ1cW.js"
	},
	"/assets/currency-I469_Xdm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"470-vyIu0KnDnQKRuCPoJWnBLEoned8\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 1136,
		"path": "../public/assets/currency-I469_Xdm.js"
	},
	"/assets/dashboard-Daa3ysBd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a138-omQcn4J69NT05sQG4rpxJ6/LWBs\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 41272,
		"path": "../public/assets/dashboard-Daa3ysBd.js"
	},
	"/assets/future-message-placeholder-BcJdb5S_.mp3": {
		"type": "audio/mpeg",
		"etag": "\"2867-NXHvORdI4B9Gtbms6eSepLHTjfs\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 10343,
		"path": "../public/assets/future-message-placeholder-BcJdb5S_.mp3"
	},
	"/assets/index-Dshpr-FE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"50a13-+XZkKwN1VwHCL4SWbFsEyIOfv1E\"",
		"mtime": "2026-11-07T14:56:58.458Z",
		"size": 330259,
		"path": "../public/assets/index-Dshpr-FE.js"
	},
	"/assets/outlook-CThm_QfF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b3-hCxeGTTMLXw2V2LOE5ug9PIuLLQ\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 435,
		"path": "../public/assets/outlook-CThm_QfF.js"
	},
	"/assets/profile-FMz91nHk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e91-Jq71/lQpvPtRacHNeiPKNFltNbg\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 11921,
		"path": "../public/assets/profile-FMz91nHk.js"
	},
	"/assets/send-CpUe-wEo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"342-kmJncC5Xv5CzUx6uN1lDqDZElz8\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 834,
		"path": "../public/assets/send-CpUe-wEo.js"
	},
	"/assets/setup-HtmeNZy5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2529-lDMZzUN5kmFGjXsnTdnhtVHLXjw\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 9513,
		"path": "../public/assets/setup-HtmeNZy5.js"
	},
	"/assets/speak-Cm-KstDW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1dcb-6+ottZpJRtQUsoCToRr6Y2c0nSw\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 7627,
		"path": "../public/assets/speak-Cm-KstDW.js"
	},
	"/assets/styles-DsmExW1-.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1396a-gwU0T2axE6fqPtD1SBjUyphPO3g\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 80234,
		"path": "../public/assets/styles-DsmExW1-.css"
	},
	"/assets/welcome-BMrTDvXv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c4-nU0lpbnEUnXctAso2+H5FU5rhhU\"",
		"mtime": "2026-11-07T14:56:58.465Z",
		"size": 1220,
		"path": "../public/assets/welcome-BMrTDvXv.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_GwntQZ = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_GwntQZ
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
