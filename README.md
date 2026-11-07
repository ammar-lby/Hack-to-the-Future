# Hack to the Future: Future You

GreatUniHack 2026, NatWest challenge: AI-Powered Financial Inclusion & Resilience.

**Future You** is an AI money coach for people with irregular income whose first language isn't English. It forecasts 90 days ahead ("financial time travel"), spots weeks where money will run short, and plays a message from "Future You" in the user's own language, with a coach they can type or talk to.

> Most budgeting apps tell you where your money went. Future You tells you where it's going.

## Team and branches

| Person | Role | Branch | Folder |
|---|---|---|---|
| Nulara | Frontend (Lovable) | `nulara-frontend` | `frontend/` |
| Melanius | n8n setup, Claude workflows (`/coach`, `/future-message`) | `melanius-n8n` | `n8n/` |
| Ammar | Persona data, forecast, "simulate next week", "Can I afford it?" | `ammar-forecast` | `forecast/`, `data/` |
| Ibrahim | ElevenLabs voice (`/speak`), audio playback, backup audio | `ibrahim-voice` | `voice/` |

## How we work

1. Work on **your own branch**, in **your own folder**.
2. Commit small and often: `git add <your folder>`, `git commit -m "..."`, `git push`.
3. When something works, merge it into `main` (open a pull request, or `git checkout main && git pull && git merge <your-branch> && git push`).
4. Always `git pull` before you start.
5. **Never commit API keys.** Keys live in n8n credentials only.
6. Feature freeze at **4:30 pm**. Everything should be on `main` by 5:00 pm.

## Structure

```
data/yusuf.json        persona: Yusuf, delivery rider in Manchester, Arabic speaker (Ammar)
forecast/forecast.js   90-day forecast, plain JavaScript, no AI (Ammar)
forecast/test.js       run: node forecast/test.js
n8n/                   exported n8n workflows + the API contracts (Melanius, Ibrahim)
frontend/              notes for the Lovable app (Nulara)
voice/                 ElevenLabs notes and backup demo MP3s (Ibrahim)
```

## How it fits together

```
Lovable app ──► forecast(yusuf.json)            → chart, risk weeks
            ──► n8n /future-message  → Claude → ElevenLabs → { text, audio }
            ──► n8n /coach           → Claude → ElevenLabs → { text, audio }
```

The forecast is plain code. **The AI never calculates numbers; it only explains them.**

## Timeline (12:00 to 6:00 pm)

| Time | What |
|---|---|
| 12:00–1:15 | Accounts, n8n set up, persona data, agree the contracts in `n8n/README.md` |
| 1:15–3:00 | Screens, forecast, Claude workflows, ElevenLabs `/speak` |
| 3:00–4:30 | Join everything up, Arabic, proactive alert, stretch goals |
| 4:30–5:15 | Feature freeze, bug fixes, merge to `main` |
| 5:15–6:00 | Slides, rehearse twice, record a backup video |
