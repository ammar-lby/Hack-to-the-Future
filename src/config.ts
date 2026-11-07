/**
 * n8n webhook that turns text into speech. It receives POST {text, language}
 * and returns {audio: "<base64 mp3>"}. Leave empty to use the browser's voice.
 * Only put n8n webhook URLs here — never API keys.
 */
export const TTS_WEBHOOK_URL = "";

// Fixed demo anchor: includes February rent and phone bills in the 90-day window.
export const DEMO_TODAY = "2026-11-15";

// Production n8n webhook URLs. No credentials belong in this file.
export const FUTURE_MESSAGE_WEBHOOK_URL = "";
export const COACH_WEBHOOK_URL = "https://futureyou.app.n8n.cloud/webhook/coach";
