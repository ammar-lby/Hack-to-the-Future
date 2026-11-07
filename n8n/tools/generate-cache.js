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
  const base = await post('/forecast', {});
  fs.writeFileSync('src/mock/forecast.json', JSON.stringify(base, null, 2));
  const fixed = await post('/forecast', { options: { billChanges: { 'Car insurance (annual)': 62 } } });
  fs.writeFileSync('src/mock/forecast_fixed.json', JSON.stringify(fixed, null, 2));

  for (const language of ['en', 'ar']) {
    // Future You call
    const call = await post('/future-message', { language, demo_mode: false });
    saveMp3(`adam_${language}_future_message`, call.audio);
    fs.writeFileSync(`src/mock/future_call_${language}.json`, JSON.stringify({ ...call, audio: null, audio_url: `/audio/adam_${language}_future_message.mp3`, cached: true }, null, 2));

    // Coach answers to the three suggestion chips
    const chips = { en: ['What can I do?', 'Can I move a bill?', 'Where can I get free help?'],
                    ar: ['ماذا أستطيع أن أفعل؟', 'هل يمكنني تغيير موعد فاتورة؟', 'أين أجد مساعدة مجانية؟'] }[language];
    for (const [i, text] of chips.entries()) {
      const c = await post('/coach', { language, messages: [{ role: 'user', content: text }] });
      if (c.audio) saveMp3(`adam_${language}_coach_${i + 1}`, c.audio);
      fs.writeFileSync(`src/mock/coach_${language}_${i + 1}.json`, JSON.stringify({ ...c, audio: null, audio_url: `/audio/adam_${language}_coach_${i + 1}.mp3` }, null, 2));
    }
  }
  console.log('Done. Listen to every file before the demo.');
})().catch(e => { console.error(e); process.exit(1); });
