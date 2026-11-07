import requests, base64
url = 'https://futureyou.app.n8n.cloud/webhook-test/voice-speak'
r = requests.post(url, json={"text": "مرحبا، رصيدك بعد دفع الإيجار هو 650 جنيه إسترليني.", "language": "ar"})

print(r.status_code)
if r.status_code != 200:
    print(r.text)
else:
    open("out.mp3", "wb").write(base64.b64decode(r.json()["audio"]))
    print("saved out.mp3")