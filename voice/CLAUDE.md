# Brief for Ibrahim's Claude: voice (ElevenLabs)

You are helping **Ibrahim**, who owns the **voice** part of a 6-hour hackathon project (GreatUniHack 2026, 12:00 to 6:00 pm, NatWest challenge: AI-Powered Financial Inclusion & Resilience). Help him build fast and keep it working for a live demo. Prefer the simplest thing that works. Don't redesign other people's parts.

## The project
**Future You** is a web app (built in Lovable) for people with irregular income whose first language isn't English. Our demo persona is **Adam**, a delivery rider in Manchester who speaks Arabic, earns £230–£420 a week and sends money home to Libya.

- A plain-JavaScript forecast (`forecast/forecast.js`, owned by Ammar) predicts 90 days ahead and finds risk weeks. For Adam: **£143 short from early January, because car insurance and rent land in the same week; fix: save £16 a week for 9 weeks.**
- Claude (in n8n workflows owned by Melanius) turns that into a short **"Message from Future You"** and powers a **coach chat**.
- **Ibrahim's job:** turn that text into speech with ElevenLabs, in English and Arabic, and make it play in the app.

There is **no phone call**. Everything happens inside the web app: a "Message from Future You" card with a play button, speaker icons on coach replies, and speaker icons on dashboard cards for accessibility (low literacy, visual impairment, limited English).

## Team
| Person | Owns | Branch |
|---|---|---|
| Nulara | Lovable frontend | `nulara-frontend` |
| Melanius | n8n setup, `/future-message` and `/coach` (Claude) | `melanius-n8n` |
| Ammar | Persona data, forecast | `ammar-forecast` |
| **Ibrahim** | **ElevenLabs voice, `/speak`, audio playback, backup audio** | **`ibrahim-voice`** |

Ibrahim works on the `ibrahim-voice` branch, in the `voice/` folder (plus exported n8n workflows in `n8n/`). Pull before starting, commit small and often, merge to `main` when something works.

## Hard rules
- **Never put the ElevenLabs API key in code, the repo, the frontend or the group chat.** It lives only in n8n as a credential.
- Don't edit other people's workflows or folders. To change something in Melanius's workflows, agree it with him first (the usual change is adding the audio step at the end).
- Keep the shared shapes below exactly as they are.
- If text-to-speech fails, the app must still show the text. Never leave a blank card.
- Feature freeze is at 4:30 pm. After that, only fix bugs.

## Shared shapes (contracts)
- Melanius's workflows currently return `{ text }`. After Ibrahim's step they return **`{ text, audio }`**.
- `/speak` (Ibrahim's own workflow): input `{ "text": "...", "language": "en" | "ar" }`, output **`{ "audio": "<base64 MP3>" }`**.
- `language` is always `"en"` or `"ar"`.

## Step 1: setup (12:00–12:30)
1. Ibrahim creates an ElevenLabs account and checks the free character allowance. Each spoken character uses credit, so keep test text short.
2. Profile → API Keys → create a key.
3. Accept Melanius's n8n invite. In n8n, create a **Header Auth** credential: name `xi-api-key`, value = the key.
4. Pick voices in the ElevenLabs Voice Library: calm, warm, friendly coach, not advert-like.
   - English coach voice
   - Arabic coach voice (test an Arabic sentence on the website first; if it sounds wrong, try another voice now)
   - Future You voice (can be a different stock voice so it feels like a separate character)
5. Write the voice IDs into the table in `voice/README.md` and commit.

## Step 2: models
- `eleven_flash_v2_5`: very fast, supports Arabic. **Default** for coach replies and read-outs.
- `eleven_multilingual_v2`: more natural and expressive, slower. Use it for the **Future You message**.

## Step 3: the API call
```
POST https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128
Headers: xi-api-key: <credential>, Content-Type: application/json
Body:
{
  "text": "<text>",
  "model_id": "eleven_flash_v2_5",
  "voice_settings": { "stability": 0.5, "similarity_boost": 0.75 }
}
```
The response body is the MP3 file (binary).

## Step 4: build `/speak` in n8n (12:30–2:00)
1. **Webhook** node: POST, path `speak`, respond using a "Respond to Webhook" node. Enable CORS for the Lovable domain (or `*` for the hackathon).
2. **Code** node: choose the voice ID and model from `language` (and an optional `kind: "future" | "coach"`):
   ```js
   const { text, language = "en", kind = "coach" } = $input.first().json.body;
   const voices = { en: "EN_VOICE_ID", ar: "AR_VOICE_ID", future: "FUTURE_VOICE_ID" };
   const voiceId = kind === "future" ? voices.future : (voices[language] || voices.en);
   const model = kind === "future" ? "eleven_multilingual_v2" : "eleven_flash_v2_5";
   return [{ json: { text, voiceId, model } }];
   ```
3. **HTTP Request** node: the call above, URL `https://api.elevenlabs.io/v1/text-to-speech/{{$json.voiceId}}?output_format=mp3_44100_128`, credential = the Header Auth one, JSON body with `text` and `model_id`. Set **Response → Response Format: File** so the MP3 arrives as binary.
4. **Convert to base64.** Use the "Extract from File" node with the operation that moves the binary file into a base64 string (node names differ slightly between n8n versions; look for "Move File to Base64 String"). Output field: `audio`.
5. **Respond to Webhook**: JSON `{ "audio": "{{$json.audio}}" }`.
6. Test with "Test workflow" and a sample body: `{ "text": "مرحبا آدم", "language": "ar" }`. Decode the base64 and play it to check it sounds right.
7. Export the workflow (menu → Download) to `n8n/speak.json` and commit on `ibrahim-voice`.

## Step 5: add audio to Melanius's workflows (2:00–3:00)
Agree this with Melanius first. At the end of `/future-message` and `/coach`, after Claude's text:
- either call `/speak` with an HTTP Request node (`kind: "future"` for `/future-message`),
- or copy the same ElevenLabs HTTP + base64 nodes in.

The final response must be `{ "text": "...", "audio": "<base64>" }`. If ElevenLabs errors, still return `{ text, audio: null }` (enable "Continue On Fail" on the HTTP node).

## Step 6: playback in the app (with Nulara)
Give Nulara this:
```js
function playAudio(base64) {
  if (!base64) return; // text is already shown, so silence is acceptable
  const audio = new Audio("data:audio/mpeg;base64," + base64);
  audio.play().catch(() => {}); // browsers block autoplay; only play on a button tap
}
```
Where:
- **Message from Future You** card: a big play button styled like a voice note, with the text shown underneath. Play only when tapped (no autoplay).
- **Coach chat**: a speaker icon on each reply.
- **Dashboard cards**: a speaker icon that reads the card aloud. These can call `/speak` directly with the card text.
- Arabic text must display right to left (`dir="rtl"`).

## Step 7: demo safety (3:00–4:30), the most important part
- Generate the main demo Future You message in **English and Arabic** once, and save the MP3s in `voice/backup-audio/` (`future-you-en.mp3`, `future-you-ar.mp3`). Commit them.
- Ask Nulara to fall back to these files if a request fails or takes longer than about 5 seconds.
- Ask Melanius to keep Future You messages to 40–60 words. Shorter is faster and cheaper.
- Check the free credit balance before the demo.

The demo message is about this risk: £143 short from early January, car insurance and rent in the same week, fix: save £16 a week for 9 weeks.

## Stretch goals (only after the core works, before 4:30)
1. **Future You in your own voice (opt-in).** The user records about a minute of speech in the app, ElevenLabs makes an instant voice clone, and only the Future You card uses that voice. Usually needs a paid ElevenLabs plan, so check first. For the demo, clone a teammate's voice **with their consent** (Ammar speaks Arabic). The pitch must include the safeguards: opt-in, your own voice only, recorded live in the app, used only to speak to you, labelled "AI-generated using your voice", one-tap delete, and "your bank will never call you in your own voice." If it doesn't work by 4:30, drop it and keep the stock Future You voice.
2. **Talking back.** Speech to text so users can speak to the coach. Quickest route: the browser's Web Speech API in Chrome, sending the text to `/coach` like a typed message. ElevenLabs also has its own speech-to-text.

## Checklist
- [ ] Key in n8n, voices chosen, Arabic tested (by 12:30)
- [ ] `/speak` returns playable audio (by 2:00)
- [ ] `/future-message` and `/coach` return `{ text, audio }` (by 3:00)
- [ ] Play buttons work in the app: Future You card, coach replies, dashboard cards (by 4:30)
- [ ] Backup MP3s saved and fallback wired (by 4:30)
- [ ] Workflows exported to `n8n/` and merged to `main` (by 5:00)
