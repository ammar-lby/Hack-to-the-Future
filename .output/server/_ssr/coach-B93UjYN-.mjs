import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { o as useLanguage, r as cn, t as Button } from "./button-CjzHUPf3.mjs";
import { t as AppHeader } from "./currency-BVmo3hFw.mjs";
import { c as loadProfile, t as Money } from "./profile-CejQXid0.mjs";
import { c as RefreshCw, d as Mic, l as Play, o as Send, p as LoaderCircle, r as Square, u as Pause } from "../_libs/lucide-react.mjs";
import { h as useSpeakState, n as COACH_WEBHOOK_URL, o as pauseAudio, p as stopSpeaking, r as buildOutlook, s as playAudio, t as BottomNav } from "./speak-D6URt4fr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coach-B93UjYN-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var recognitionLocales = {
	en: "en-GB",
	ar: "ar-SA",
	hi: "hi-IN",
	bn: "bn-BD",
	ur: "ur-PK"
};
function coachPayload(messages, language, forecast) {
	return {
		messages: messages.map(({ role, content }) => ({
			role,
			content
		})),
		language,
		forecast
	};
}
async function requestCoach(messages, language, forecast, signal) {
	const response = await fetch(COACH_WEBHOOK_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(coachPayload(messages, language, forecast)),
		signal
	});
	if (!response.ok) throw new Error(`Coach ${response.status}`);
	const result = await response.json();
	if (!result || typeof result !== "object" || !("text" in result) || typeof result.text !== "string" || !result.text.trim()) throw new Error("Missing reply");
	const audio = "audio" in result && typeof result.audio === "string" ? result.audio : "";
	return {
		role: "assistant",
		content: result.text,
		audio
	};
}
function helpTextParts(text) {
	return text.split(/(StepChange|Citizens Advice)/gi).map((part) => ({
		text: part,
		url: part.toLowerCase() === "stepchange" ? "https://www.stepchange.org/" : part.toLowerCase() === "citizens advice" ? "https://www.citizensadvice.org.uk/" : null
	}));
}
function getRecognitionConstructor() {
	const browser = window;
	return browser.SpeechRecognition ?? browser.webkitSpeechRecognition ?? null;
}
function CoachChat() {
	const { t, lang } = useLanguage();
	const [risk, setRisk] = (0, import_react.useState)(null);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [input, setInput] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const [supported, setSupported] = (0, import_react.useState)(null);
	const [listening, setListening] = (0, import_react.useState)(false);
	const [micError, setMicError] = (0, import_react.useState)(false);
	const [audioError, setAudioError] = (0, import_react.useState)(false);
	const recognition = (0, import_react.useRef)(null);
	const controller = (0, import_react.useRef)(null);
	const busy = (0, import_react.useRef)(false);
	const pending = (0, import_react.useRef)(null);
	const end = (0, import_react.useRef)(null);
	const audio = useSpeakState();
	(0, import_react.useEffect)(() => {
		setSupported(Boolean(getRecognitionConstructor()));
		try {
			const value = JSON.parse(window.localStorage.getItem("futureyou.coachRisk") ?? "null");
			if (value && typeof value.week === "string" && typeof value.shortfall === "number" && typeof value.saveWeekly === "number" && typeof value.weeksUntil === "number") setRisk(value);
		} catch {}
		return () => {
			recognition.current?.abort();
			controller.current?.abort();
			stopSpeaking();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		recognition.current?.abort();
		setListening(false);
		controller.current?.abort();
		busy.current = false;
		setSending(false);
		setMessages([]);
		setFailed(false);
		pending.current = null;
		setInput("");
		stopSpeaking();
	}, [lang]);
	(0, import_react.useEffect)(() => {
		if (messages.length || sending) end.current?.scrollIntoView({ block: "nearest" });
	}, [messages, sending]);
	const date = (iso) => new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", {
		day: "numeric",
		month: "short",
		timeZone: "UTC"
	}).format(/* @__PURE__ */ new Date(`${iso}T00:00:00Z`));
	function contextMessage() {
		if (!risk) return [];
		return [{
			role: "user",
			content: t("coachRiskPrompt").replace("{week}", date(risk.week)).replace("{amount}", `${risk.shortfall} ${t("poundsWord")}`).replace("{weekly}", `${risk.saveWeekly} ${t("poundsWord")}`).replace("{weeks}", String(risk.weeksUntil))
		}];
	}
	async function send(next) {
		if (busy.current) return;
		recognition.current?.abort();
		setListening(false);
		busy.current = true;
		const request = new AbortController();
		controller.current = request;
		const timeout = window.setTimeout(() => request.abort(), 2e4);
		setSending(true);
		setFailed(false);
		pending.current = next;
		try {
			const result = await requestCoach([...contextMessage(), ...next], lang, buildOutlook(loadProfile()), request.signal);
			if (controller.current === request && !request.signal.aborted) {
				setMessages([...next, result]);
				pending.current = null;
			}
		} catch {
			if (controller.current === request) setFailed(true);
		} finally {
			window.clearTimeout(timeout);
			if (controller.current === request) {
				setSending(false);
				busy.current = false;
			}
		}
	}
	function submit(event) {
		event.preventDefault();
		if (!input.trim() || busy.current || failed) return;
		const next = [...messages, {
			role: "user",
			content: input.trim()
		}];
		setMessages(next);
		setInput("");
		send(next);
	}
	function toggleMic() {
		if (listening) {
			recognition.current?.stop();
			return;
		}
		const Constructor = getRecognitionConstructor();
		if (!Constructor) return;
		stopSpeaking();
		setMicError(false);
		const instance = new Constructor();
		recognition.current = instance;
		instance.lang = recognitionLocales[lang];
		instance.continuous = false;
		instance.interimResults = false;
		instance.onresult = (event) => {
			const text = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" ").trim();
			if (text) setInput((previous) => `${previous.trim()} ${text}`.trim().slice(0, 4e3));
		};
		instance.onerror = (event) => {
			if (event.error !== "aborted") setMicError(true);
			setListening(false);
		};
		instance.onend = () => setListening(false);
		try {
			instance.start();
			setListening(true);
		} catch {
			setMicError(true);
		}
	}
	async function playReply(message, index) {
		const id = `coach-reply-${index}`;
		if (audio.id === id && audio.status === "playing") {
			pauseAudio(id);
			return;
		}
		if (!message.audio) return;
		setAudioError(false);
		try {
			await playAudio("data:audio/mpeg;base64," + message.audio, id);
		} catch {
			setAudioError(true);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-bold text-secondary",
				children: t("coachTitle")
			}),
			risk && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-s-4 border-primary ps-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-bold",
						children: t("coachContext")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-lg",
						children: [
							t("outlookWeekOf"),
							" ",
							date(risk.week),
							" · ",
							t("outlookShortfall"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, {
								amount: risk.shortfall,
								className: "font-bold"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-lg",
						children: [
							t("outlookSave"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { amount: risk.saveWeekly }),
							" ",
							t("outlookWeeklyFor"),
							" ",
							risk.weeksUntil,
							" ",
							t("outlookWeeks")
						]
					})
				]
			}),
			false,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "log",
				"aria-label": t("coachChatLabel"),
				"aria-live": "polite",
				className: "min-h-36 space-y-4",
				children: [
					messages.map((message, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: cn("max-w-[90%] rounded-2xl px-4 py-3", message.role === "user" ? "ms-auto bg-secondary text-secondary-foreground" : "me-auto border border-border bg-card text-card-foreground"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-1 text-base font-bold",
								children: t(message.role === "user" ? "coachYou" : "futureSender")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "whitespace-pre-wrap break-words text-lg leading-relaxed",
								children: helpTextParts(message.content).map((part, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: part.url && message.role === "assistant" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: part.url,
									target: "_blank",
									rel: "noopener noreferrer",
									className: "font-bold text-primary underline underline-offset-4",
									children: part.text
								}) : part.text }, j))
							}),
							message.role === "assistant" && message.audio && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => playReply(message, i),
								className: "mt-3 min-h-12 text-lg",
								disabled: audio.id === `coach-reply-${i}` && audio.status === "loading",
								children: [audio.id === `coach-reply-${i}` && audio.status === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { "aria-hidden": true }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { "aria-hidden": true }), t(audio.id === `coach-reply-${i}` && audio.status === "playing" ? "coachPause" : "coachPlay")]
							})
						]
					}, i)),
					sending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "status",
						className: "me-auto flex w-fit items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-5 animate-spin motion-reduce:animate-none",
							"aria-hidden": true
						}), t("coachSending")]
					}),
					failed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "alert",
						className: "space-y-3 border-s-4 border-destructive ps-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg",
							children: t("coachError")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => {
								if (pending.current) send(pending.current);
							},
							className: "min-h-12 text-lg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { "aria-hidden": true }), t("retry")]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: end })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-3 border-t border-border pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "coach-message",
						className: "block text-lg font-bold",
						children: t("coachQuestion")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "coach-message",
						value: input,
						onChange: (event) => setInput(event.target.value),
						maxLength: 4e3,
						rows: 2,
						className: "w-full rounded-lg border-2 border-input bg-card p-3 text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [supported && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: listening ? "destructive" : "outline",
							onClick: toggleMic,
							"aria-label": t(listening ? "coachMicStop" : "coachMic"),
							"aria-pressed": listening,
							disabled: sending || failed,
							className: "size-14 shrink-0 [&_svg]:size-6",
							children: listening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { "aria-hidden": true }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { "aria-hidden": true })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: !input.trim() || sending || failed || listening,
							className: "min-h-14 flex-1 text-lg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { "aria-hidden": true }), t(sending ? "coachSending" : "coachSend")]
						})]
					}),
					listening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "text-lg text-primary",
						children: t("coachListening")
					}),
					supported === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base text-muted-foreground",
						children: t("coachMicUnsupported")
					}),
					micError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-lg text-destructive",
						children: t("coachMicError")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base text-muted-foreground",
						children: t("coachDisclaimer")
					})
				]
			}),
			audioError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-lg text-destructive",
				children: t("coachAudioError")
			})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}),
	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto max-w-xl px-4 pb-28 pt-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoachChat, {})
	}),
	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {})
] });
//#endregion
export { SplitComponent as component };
