import requests, base64
url = "https://futureyou.app.n8n.cloud/webhook-test/coach"
r = requests.post(url, json={"language": "ar", "text": "كيف أتجنب النقص في المال؟"}, timeout=120)
print(r.status_code)
d = r.json()
print(d.get("text"))
print("guarded:", d.get("guarded"), d.get("guard_reason"), "| audio_error:", d.get("audio_error"))
if d.get("audio"):
    open("coach_ar.mp3", "wb").write(base64.b64decode(d["audio"]))
    print("saved coach_ar.mp3")