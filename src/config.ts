/**
 * n8n webhook that turns text into speech. It receives POST {text, language}
 * and returns {audio: "<base64 mp3>"}. Leave empty to use the browser's voice.
 * Only put n8n webhook URLs here — never API keys.
 */
export const TTS_WEBHOOK_URL = "";
