# Connecting the Lovable app to n8n

The app talks to three n8n URLs. Each one is a `POST` with a JSON body and returns JSON. CORS is open, so the browser can call them directly. No API keys are needed in the app: Claude and ElevenLabs keys stay inside n8n.

| What the app needs | URL |
|---|---|
| Numbers for the dashboard and chart | `https://futureyou.app.n8n.cloud/webhook/forecast` |
| The "Message from Future You" | `https://futureyou.app.n8n.cloud/webhook/future-message` |
| A reply from the coach | `https://futureyou.app.n8n.cloud/webhook/coach` |

## 1. Paste this file into Lovable as `src/lib/api.ts`

```ts
// All calls to the Future You backend (n8n). No keys here, ever.
export const API_BASE = "https://futureyou.app.n8n.cloud/webhook";

// Set to true on stage if Wi-Fi is bad: the Future You message is served
// from the approved cached script instantly (no AI call).
export const DEMO_MODE = false;

export type Lang = "en" | "ar";

async function post<T>(path: string, body: unknown, timeoutMs = 20000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ---------- 1. Forecast (dashboard + 90-day chart) ----------
// options.billChanges lets you redraw the chart with a change,
// e.g. { "Car insurance (annual)": 62 } or { "Rent": 650 } ("simulate next week").
export type Risk = {
  week: string; firstDay: string; lowestDay: string; shortfall: number;
  bills: string[]; reason: string; fix: string; saveWeekly: number; weeksUntil: number;
};
export type Forecast = {
  persona: { name: string; language: string; homeCurrency: string; gbpToHome: number };
  today: string;
  currentBalance: number;
  currentBalanceHome: number;
  income: { low: number; typical: number; high: number };
  dailySpend: number;
  days: { date: string; expected: number; badCase: number; events: { name: string; amount: number }[] }[];
  risks: Risk[];
};
export const getForecast = (options: { billChanges?: Record<string, number> } = {}) =>
  post<Forecast>("forecast", { options });

// "Can I afford it?"
export const canIAfford = (date: string, amount: number, name: string) =>
  post<{ affordable: boolean; gapBefore: number; gapAfter: number; makesGapBiggerBy: number }>(
    "forecast", { canIAfford: { date, amount, name } });

// ---------- 2. Message from Future You ----------
export type FutureMessage = {
  text: string;          // the message in the user's language (Arabic or English)
  text_en: string;       // English version, show as subtitles
  audio: string | null;  // base64 MP3 once Ibrahim's voice step is added
  audio_url: string | null; // demo mode: path to a backup MP3 in /public/audio
  dir: "rtl" | "ltr";
  disclosure_text: string;
  risk: { month: string; shortfall: number; fix: string } | null;
  cached: boolean;
};
export const getFutureMessage = (language: Lang) =>
  post<FutureMessage>("future-message", { language, demo_mode: DEMO_MODE }, 25000);

// ---------- 3. Coach ----------
export type ChatMessage = { role: "user" | "assistant"; content: string };
export type CoachReply = {
  text: string; text_en: string; audio: string | null;
  plan: { id: string; title: string; effect: string }[];
  forecast_options: { billChanges: Record<string, number> } | null; // pass to getForecast() to redraw the chart
  signposts: { name: string; url: string; why: string }[];
  escalate: boolean;
  disclaimer: string;
};
export const askCoach = (messages: ChatMessage[], language: Lang) =>
  post<CoachReply>("coach", { messages, language }, 20000);

// ---------- Audio ----------
// Browsers block audio that wasn't started by a tap. Only call this inside a
// click handler (e.g. the "Answer" or "Play" button).
export function playAudio(r: { audio?: string | null; audio_url?: string | null }) {
  const src = r.audio ? `data:audio/mpeg;base64,${r.audio}` : r.audio_url;
  if (!src) return null; // no audio yet: the text on screen is the fallback
  const a = new Audio(src);
  a.play();
  return a;
}
```

## 2. Where each call goes in the app

| Screen | Call | Use |
|---|---|---|
| Dashboard (on load) | `getForecast()` | `currentBalance`, `income`, `risks[0]` for the red risk card |
| 90-day chart | `getForecast()` | `days[]`: one line for `expected`, one for `badCase`; shade `risks[0].week` red |
| "Simulate next week" | `getForecast({ billChanges: { Rent: 650 } })` | redraw the chart |
| "Message from Future You" card, Answer/Play button | `getFutureMessage(lang)` then `playAudio(res)` | show `text` (with `dir`), `text_en` underneath, `disclosure_text` |
| Coach chat, each send | `askCoach(history, lang)` | add `text` as the coach bubble, show `plan` cards and `signposts`; if `escalate`, show signposts first |
| Coach plan card "See this on my forecast" | `getForecast(reply.forecast_options)` | chart redraws with the gap closed |

Keep the chat history in state and send the whole array each time:

```ts
const [history, setHistory] = useState<ChatMessage[]>([]);
async function send(text: string) {
  const next = [...history, { role: "user", content: text } as ChatMessage];
  setHistory(next);
  const reply = await askCoach(next, lang);
  setHistory([...next, { role: "assistant", content: reply.text }]);
  // render reply.plan, reply.signposts; playAudio(reply) only if the user tapped play
}
```

## 3. Prompt to paste into Lovable

> Add the file src/lib/api.ts exactly as provided (paste the code). Use it everywhere instead of mock data:
> the dashboard and 90-day chart use getForecast(); the "Message from Future You" card calls getFutureMessage(language) when the user taps Answer, shows `text` with dir from the response, `text_en` as smaller subtitles, and calls playAudio(response) inside the same click handler; the coach chat keeps the conversation in state and calls askCoach(history, language) on each send, showing `text`, the `plan` cards and the `signposts` links. Show a "Thinking…" state while waiting, and if a call fails show a friendly error with a Retry button. Never put API keys in the frontend.

## 4. Things that will catch you out

- **Slow first call.** The Future You message takes about 7 s live (it writes, checks and translates). Show a "connecting…" call screen. On stage, set `DEMO_MODE = true` for an instant, approved message.
- **`audio` is `null` until Ibrahim adds the ElevenLabs step.** The text still shows, so the app works without it.
- **Audio won't play without a tap.** Call `playAudio` only inside a button's click handler.
- **Arabic layout.** Put `dir={res.dir}` on the element showing `text`.
- **If nothing happens,** open n8n → Executions. No run listed means the request never arrived: check the URL (it must be `/webhook/`, not `/webhook-test/`).
