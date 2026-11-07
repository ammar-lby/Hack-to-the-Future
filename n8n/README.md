# n8n workflows

## Live now (Melanius, Ammar, Ibrahim)

The JSON files in `workflows/` are exports of the live n8n workflows (last synced 7 Nov, 16:00), so the repo matches n8n. All five use **Adam** (`data/adam.json`) and **Ammar's forecast** (`forecast/forecast.js`). Only `/forecast` contains the forecast code; `/coach` and `/future-message` call `/forecast` over HTTP, so there is one source of truth. All take POST JSON, return JSON, and allow CORS from any origin.

To find a URL yourself: open the workflow in n8n, double-click the first (Webhook) box, and copy the **Production URL** (`/webhook/...`, not `/webhook-test/...`). It only works while the workflow is published.

| Endpoint | Request | Response | Tested |
|---|---|---|---|
| `https://futureyou.app.n8n.cloud/webhook/forecast` | `{}`, `{ options: { billChanges, payChanges } }`, `{ canIAfford: { date, amount, name } }`, `{ simulate: "next_week" }` or `{ bufferPot: true }` (last two need the updated Code node) | output of `forecast()` / `canIAfford()` / `simulateNextWeek()` / `bufferPot()`; each risk now has a `why` breakdown | £143 short in slow weeks from w/c 4 Jan; fix "Save £16 a week for 9 weeks" |
| `https://futureyou.app.n8n.cloud/webhook/coach` | `{ messages: [{ role, content }], language, forecast?, options? }` | `{ text, text_en, audio, audio_mime, plan, forecast_options, signposts, escalate, disclaimer }` | Arabic reply to Adam (masculine) in 4.4 s; refuses payday loans |
| `https://futureyou.app.n8n.cloud/webhook/future-message` | `{ language, risk?, options?, demo_mode? }` | `{ text, text_en, audio, audio_url, risk, disclosure_text, dir, cached, guarded }` | Live Arabic in 7.5 s; `demo_mode: true` returns the approved cached script instantly |
| `https://futureyou.app.n8n.cloud/webhook/voice-speak` (Ibrahim) | `{ text, language }` | `{ audio, language }` (base64 MP3, ElevenLabs `eleven_v3`) | Arabic and English voices |
| `https://futureyou.app.n8n.cloud/webhook/voice-transcribe` (Ibrahim) | multipart form, audio file in field `audio` | `{ transcript, detected_language, error }` (ElevenLabs `scribe_v2`) | |

How the AI is kept honest (say this to judges): code computes the forecast and prices each option (`Save £16 a week…` covers the £143 gap; paying the car insurance monthly at about £62 clears it). Claude only explains those numbers. A guard node rejects any reply containing a £ figure that isn't in the forecast, and a second guard checks the Arabic translation kept every amount. Any failure falls back to the approved script in `prompts/cached-scripts.md`.

If the app sends its own `forecast` with a coach question (Nulara's CoachChat does), `/coach` uses those numbers instead of calling `/forecast`, so the coach always matches what the Outlook screen shows, including the demo date (15 Nov) and "simulate next week".

`forecast_options` in a coach reply can be posted straight back to `/forecast` to redraw the chart with the suggested change.

**Voice (done, Ibrahim):** `/coach` (after **Guard reply**) and `/future-message` (after **Final message**, live path only) call `/voice-speak` and attach the base64 MP3 as `audio`. If voice fails, `audio` is `null`, `audio_error` is `"voice_unavailable"`, and the app shows the text. The demo-mode cached path has no audio; it uses the backup MP3s.

How to connect the Lovable app: see [CONNECT-FRONTEND.md](CONNECT-FRONTEND.md) (paste-ready `api.ts` + Lovable prompt).

Files here:

```
workflows/   exports of the live workflows: forecast, coach, future-message, voice-speak, voice-transcribe
             (import via n8n "Import from file", then re-select the Anthropic / ElevenLabs credentials; no keys are in these files)
prompts/     coach, script-writer and translation prompts, plus the approved cached scripts
tools/       generate-cache.js: calls the live endpoints and saves demo MP3s + mock JSON for the frontend
```

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
