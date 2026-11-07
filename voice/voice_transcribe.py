import sys
import requests

if len(sys.argv) < 2:
    print("Usage: python3 voice/voice_transcribe.py path/to/file.mp3")
    sys.exit(1)

path = sys.argv[1]
url = "https://futureyou.app.n8n.cloud/webhook-test/voice-transcribe"

with open(path, "rb") as f:
    r = requests.post(url, files={"audio": ("audio.mp3", f, "audio/mpeg")}, data={"language": "ar"})

print(r.status_code)
print(r.text)