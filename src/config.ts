/**
 * n8n webhook that turns text into speech. It receives POST {text, language}
 * and returns {audio: "<base64 mp3>"}. Leave empty to use the browser's voice.
 * Only put n8n webhook URLs here — never API keys.
 */
export const TTS_WEBHOOK_URL = "https://futureyou.app.n8n.cloud/webhook/voice-speak";

// Fixed demo anchor (hackathon day). Matches the n8n /forecast, so the app, coach and voice note agree: £143 short, £16/week for 9 weeks.
export const DEMO_TODAY = "2026-11-07";

// Production n8n webhook URLs. No credentials belong in this file.
export const FUTURE_MESSAGE_WEBHOOK_URL = "";
export const COACH_WEBHOOK_URL = "https://futureyou.app.n8n.cloud/webhook/coach";

// ElevenLabs Scribe via n8n. POST multipart with an "audio" file -> {transcript, detected_language, error}.
export const TRANSCRIBE_WEBHOOK_URL = "https://futureyou.app.n8n.cloud/webhook/voice-transcribe";
