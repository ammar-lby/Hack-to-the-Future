import requests, base64

import os
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "audio")
os.makedirs(OUT_DIR, exist_ok=True)

URL = "https://futureyou.app.n8n.cloud/webhook/voice-speak"
TEXTS = {
    "en": "Hi Adam, it's you, from the future. January into early February was hard. Rent and the yearly car insurance landed together. In the slow weeks, we were up to £143 short. Two things would have helped. Saving £16 a week, starting now, for nine weeks. Or paying the car insurance monthly instead. Citizens Advice can help for free. Open the app, and let's talk it through.",
    "ar": "مرحبًا آدم، أنا أنتَ، من المستقبل. كانت الفترة من يناير إلى أوائل فبراير صعبة. خرج الإيجار وتأمين السيارة السنوي معًا. وفي الأسابيع الهادئة، كان ينقصنا ما يصل إلى مئة وثلاثة وأربعين جنيهًا. شيئان كانا سيساعداننا: أن ندّخر ستة عشر جنيهًا كل أسبوع، من الآن ولمدة تسعة أسابيع. أو أن ندفع تأمين السيارة شهريًا بدلًا من دفعة واحدة. منظمة Citizens Advice تساعد مجانًا. افتح التطبيق، ولنتحدث معًا.",
}

for lang, text in TEXTS.items():
    r = requests.post(URL, json={"text": text, "language": lang})
    print(lang, r.status_code)
    if r.status_code == 200:
        open(os.path.join(OUT_DIR, f"adam_{lang}_future_message.mp3"), "wb").write(base64.b64decode(r.json()["audio"]))