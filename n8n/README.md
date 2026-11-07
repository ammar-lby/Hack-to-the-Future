# n8n workflows

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
