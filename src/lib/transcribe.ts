import { TRANSCRIBE_WEBHOOK_URL } from "@/config";

export type Recorder = { stop: () => Promise<Blob>; cancel: () => void };

/** True when the browser can record and the n8n transcribe webhook is configured. */
export function canRecord() {
  return Boolean(TRANSCRIBE_WEBHOOK_URL) && typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
}

function pickMime() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(type => MediaRecorder.isTypeSupported(type)) ?? "";
}

/** Ask for the microphone and start recording. Call only from a click. */
export async function startRecording(): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mime = pickMime();
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks: Blob[] = [];
  recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
  const release = () => stream.getTracks().forEach(track => track.stop());
  recorder.start();
  return {
    stop: () => new Promise<Blob>(resolve => {
      recorder.onstop = () => { release(); resolve(new Blob(chunks, { type: recorder.mimeType || mime || "audio/webm" })); };
      recorder.stop();
    }),
    cancel: () => { recorder.onstop = null; if (recorder.state !== "inactive") recorder.stop(); release(); },
  };
}

/** Send the recording to n8n (ElevenLabs Scribe) and return the transcript text. */
export async function transcribe(blob: Blob, signal: AbortSignal): Promise<string> {
  const form = new FormData();
  form.append("audio", blob, blob.type.includes("mp4") ? "speech.mp4" : "speech.webm");
  const response = await fetch(TRANSCRIBE_WEBHOOK_URL, { method: "POST", body: form, signal });
  if (!response.ok) throw new Error(`Transcribe ${response.status}`);
  const result: unknown = await response.json();
  const text = result && typeof result === "object" && "transcript" in result && typeof result.transcript === "string" ? result.transcript.trim() : "";
  if (!text) throw new Error("Empty transcript");
  return text;
}
