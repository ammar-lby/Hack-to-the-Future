// Generate the demo audio cache by calling YOUR n8n webhooks (keys stay in n8n).
// Usage: N8N_BASE=https://<you>.app.n8n.cloud/webhook node generate-cache.js
// Output: ./public/audio/*.mp3 and ./src/mock/*.json, ready to drop into the Lovable project.
const fs = require('fs');
const BASE = process.env.N8N_BASE;
if (!BASE) { console.error('Set N8N_BASE'); process.exit(1); }
fs.mkdirSync('public/audio', { recursive: true });
fs.mkdirSync('src/mock', { recursive: true });

const post = async (path, body) => {
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.json();
};
const saveMp3 = (name, b64) => { fs.writeFileSync(`public/audio/${name}.mp3`, Buffer.from(b64, 'base64')); console.log('saved', name); };

(async () => {
  // Forecast mocks (baseline + fixed) for the dashboard
  const base = await post('/forecast', { persona_id: 'amira' });
  fs.writeFileSync('src/mock/forecast.json', JSON.stringify(base, null, 2));
  const fixed = await post('/forecast', { persona_id: 'amira', scenario: { set_aside_per_good_week: 20, spread_yearly: ['insurance'] } });
  fs.writeFileSync('src/mock/forecast_fixed.json', JSON.stringify(fixed, null, 2));

  for (const language of ['en', 'ar']) {
    // Future You call
    const call = await post('/future-call', { persona_id: 'amira', language, risk_id: base.headline_risk.id, demo_mode: false });
    saveMp3(`amira_${language}_future_call`, call.audio_base64);
    fs.writeFileSync(`src/mock/future_call_${language}.json`, JSON.stringify({ ...call, audio_base64: null, audio_url: `/audio/amira_${language}_future_call.mp3`, cached: true }, null, 2));

    // Coach answers to the three suggestion chips
    const chips = { en: ['What can I do?', 'Can I move a bill?', 'Where can I get free help?'],
                    ar: ['ماذا أستطيع أن أفعل؟', 'هل يمكنني تغيير موعد فاتورة؟', 'أين أجد مساعدة مجانية؟'] }[language];
    for (const [i, text] of chips.entries()) {
      const c = await post('/coach', { persona_id: 'amira', language, session_id: 'cache', demo_mode: false, input: { type: 'text', text }, history: [] });
      if (c.audio_base64) saveMp3(`amira_${language}_coach_${i + 1}`, c.audio_base64);
      fs.writeFileSync(`src/mock/coach_${language}_${i + 1}.json`, JSON.stringify({ ...c, audio_base64: null, audio_url: `/audio/amira_${language}_coach_${i + 1}.mp3` }, null, 2));
    }
  }
  console.log('Done. Listen to every file before the demo.');
})().catch(e => { console.error(e); process.exit(1); });
