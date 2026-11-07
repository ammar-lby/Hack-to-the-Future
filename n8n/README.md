# n8n workflows

## Live now (Melanius)

Three workflows are built, tested and published on `futureyou.app.n8n.cloud`. All take POST JSON, return JSON and allow CORS from any origin.

| Endpoint | What it does | Tested |
|---|---|---|
| `https://futureyou.app.n8n.cloud/webhook/forecast` | 90-day forecast in a Code node (no AI) | £140 short, week of 8 Feb |
| `https://futureyou.app.n8n.cloud/webhook/coach` | Code builds FACTS + priced options → Claude Haiku explains → guard rejects invented £ figures | Arabic reply 3.5 s; refuses payday loans |
| `https://futureyou.app.n8n.cloud/webhook/future-call` | Claude Sonnet writes the Future You script → guard → Arabic translation → guard. `demo_mode: true` returns the cached script + MP3 path instantly | Live 5.4 s; demo 0.08 s |

Files in this folder:

```
workflows/   importable exports of the three live workflows (re-select the Anthropic credential after import)
prompts/     the coach, script-writer and translation prompts with their guardrails
reference/   forecast + persona the workflows currently embed, and generate-cache.js for demo audio
```

Voice hand-off (Ibrahim): in `/future-call`, add the ElevenLabs step between **Final script (voice goes after this)** and **Respond live**, reading `script_text` and `language`, writing `audio_base64`. `/coach` returns `audio_base64: null` until the same step is added after **Guard reply**.

### Not yet aligned with the contract below

These were built from the earlier build plan (`docs/build-plan.md`) before this README's contract was agreed, so they differ:

| | This README's contract | What is live |
|---|---|---|
| Persona | Adam, `data/adam.json` | Amira (embedded, `reference/persona-amira.json`) |
| Forecast | `forecast/forecast.js` (Ammar) | its own version (`reference/forecast-amira.js`) |
| Message endpoint | `/future-message` → `{ text, audio }` | `/future-call` → `{ script_text, subtitle_en, audio_base64, ... }` |
| Coach input/output | `{ messages, language, forecast }` → `{ text, audio }` | `{ persona_id, language, input, history }` → `{ reply_text, reply_en, plan, signposts, ... }` |

Next step: swap the embedded persona and forecast for `data/adam.json` + Ammar's `forecast/forecast.js` (his `n8n/forecast-code-node.js` on `ammar-forecast`), and add `/future-message` and `text`/`audio` fields so the frontend gets the agreed shapes. The guards, prompts and demo-mode path carry over unchanged.

---

One shared n8n Cloud account (Melanius owns it and invites everyone). API keys are stored once as **credentials** and never go in code or chat.

| Workflow | Owner | Input (POST JSON) | Output |
|---|---|---|---|
| `/future-message` | Melanius | `{ risk, language, persona }` | `{ text, audio }` |
| `/coach` | Melanius | `{ messages, language, forecast }` | `{ text, audio }` |
| `/speak` | Ibrahim | `{ text, language }` | `{ audio }` (base64 MP3) |
| `/forecast` (optional) | Ammar | `{ data, options }` | output of `forecast()` |

`audio` is added by Ibrahim's ElevenLabs step at the end of Melanius's workflows.

## Shared shapes (agree these, don't change them without telling everyone)

**risk** (from `forecast()`; Melanius can hard-code this until the forecast is wired in):
```json
{
  "week": "2027-01-04",
  "firstDay": "2027-01-10",
  "shortfall": 143,
  "bills": ["Car insurance (annual)", "Rent"],
  "reason": "Car insurance (annual) and Rent due in the same week",
  "fix": "Save £16 a week for 9 weeks",
  "saveWeekly": 16,
  "weeksUntil": 9
}
```

**language**: `"en"` or `"ar"`.

**persona**: `{ "name": "Adam", "language": "ar", "homeCurrency": "LYD" }`

## Melanius: building `/future-message` and `/coach`

Each workflow: **Webhook (POST)** → **HTTP Request to Claude** → (Ibrahim's ElevenLabs step) → **Respond to Webhook**.

Claude call (HTTP Request node):
- `POST https://api.anthropic.com/v1/messages`
- Headers: `x-api-key` (credential), `anthropic-version: 2023-06-01`, `content-type: application/json`
- Body: `model`, `max_tokens`, `system` (rules below), `messages`

System prompt rules for both:
- Reply only in the user's language (`ar` means Arabic).
- Use only the numbers given in the forecast or risk. Never invent or recalculate numbers.
- No regulated financial advice and no product recommendations. For serious difficulty, signpost free help (StepChange, Citizens Advice).
- Say you are an AI if asked. Be warm, short and practical.
- `/future-message`: speak as the user's future self, 40–60 words, mention the shortfall, the reason and the fix.

Webhook settings: allow CORS from the Lovable domain, or the browser blocks the call.

## Ammar: optional `/forecast` in n8n

The forecast can run in the frontend, so this is optional. To run it in n8n: Webhook → **Code** node (Run once for all items). Paste everything from `forecast/forecast.js` (above the `module.exports` line), then add:

```js
const body = $input.first().json.body;
return [{ json: forecast(body.data, body.options || {}) }];
```

## Export your workflows

When a workflow works: workflow menu → **Download**, save the JSON in this folder on your branch, commit and push. It's our backup and it shows the judges the backend.
