# Voice (Ibrahim)

ElevenLabs text-to-speech for the Future You message, coach replies and dashboard read-outs.

## Setup
- One ElevenLabs account. API key goes into n8n as a Header Auth credential (`xi-api-key`). Never commit it.
- Pick two voices (English and Arabic), test Arabic on the website first, note the voice IDs here.

| Use | Voice ID | Model |
|---|---|---|
| Coach (English) | _tbc_ | `eleven_flash_v2_5` |
| Coach (Arabic) | _tbc_ | `eleven_flash_v2_5` |
| Future You | _tbc_ | `eleven_multilingual_v2` |

## API
```
POST https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128
xi-api-key: <credential>
{ "text": "...", "model_id": "eleven_flash_v2_5", "voice_settings": { "stability": 0.5, "similarity_boost": 0.75 } }
```
Returns an MP3. In n8n, convert it to base64 and return `{ audio }`.

## To do
- [ ] `/speak` workflow returns playable audio
- [ ] Audio step added to `/future-message` and `/coach`
- [ ] Play buttons work in the app (with Nulara)
- [ ] Backup MP3s of the demo Future You message (English and Arabic) saved in `backup-audio/`
- [ ] Stretch: Future You in the user's own cloned voice (opt-in, with consent)
