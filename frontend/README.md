# Frontend (Nulara)

Built in Lovable. Lovable syncs to its own GitHub repo; copy anything important here, or link that repo below.

Lovable repo: _add link_

## Screens
1. Language picker (English, Arabic + others listed) and home currency
2. Dashboard: balance (GBP + home currency toggle), income, spending by category, speaker buttons
3. Time-travel chart: 90 days, `expected` and `badCase` lines, risk weeks in red, slider
4. "Message from Future You" card: play button, text underneath, 2–3 action buttons
5. Coach chat: type or speak, replies with a play button
6. "Simulate next week" button (proactive alert demo)

## Data
- Persona: `data/adam.json`
- Forecast: `forecast/forecast.js` (copy into Lovable as `src/lib/forecast.ts`)
- Webhooks: see `n8n/README.md`
- Arabic text must display right to left (`dir="rtl"`)

Play audio from n8n:
```js
new Audio("data:audio/mpeg;base64," + response.audio).play();
```
