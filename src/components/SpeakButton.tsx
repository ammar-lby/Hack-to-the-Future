import { Loader2, Square, Volume2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { speak, stopSpeaking, useSpeakState } from "@/lib/speak";
import { cn } from "@/lib/utils";

/** Large speaker button that reads `text` aloud in the chosen language. */
export function SpeakButton({ id, text, label, inverted }: { id: string; text: string; label: string; inverted?: boolean }) {
  const { t, lang } = useLanguage();
  const s = useSpeakState();
  const active = s.id === id ? s.status : "idle";
  const onClick = () => (active === "idle" ? speak(text, lang, id) : stopSpeaking());
  const Icon = active === "loading" ? Loader2 : active === "playing" ? Square : Volume2;
  const word = active === "loading" ? t("loadingAudio") : active === "playing" ? t("stopAudio") : t("listen");
  return (
    <button type="button" onClick={onClick} aria-label={active === "idle" ? `${t("listenTo")} ${label}` : word} aria-busy={active === "loading"}
      className={cn("inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-base font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
        inverted ? "border-secondary-foreground/60 text-secondary-foreground" : "border-secondary text-secondary",
        active !== "idle" && (inverted ? "bg-secondary-foreground text-secondary" : "bg-secondary text-secondary-foreground"))}>
      <Icon aria-hidden className={cn("size-5", active === "loading" && "animate-spin")} />
      <span aria-live="polite">{word}</span>
    </button>
  );
}
