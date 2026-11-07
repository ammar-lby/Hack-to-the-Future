import { Loader2, Square, Volume2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { speak, stopSpeaking, useSpeakState } from "@/lib/speak";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Compact round speaker button that reads `text` aloud in the chosen language. */
export function SpeakButton({ id, text, label, inverted }: { id: string; text: string; label: string; inverted?: boolean }) {
  const { t, lang } = useLanguage();
  const s = useSpeakState();
  const active = s.id === id ? s.status : "idle";
  const onClick = () => (active === "idle" ? speak(text, lang, id) : stopSpeaking());
  const Icon = active === "loading" ? Loader2 : active === "playing" ? Square : Volume2;
  const word = active === "loading" ? t("loadingAudio") : active === "playing" ? t("stopAudio") : t("listen");
  return (
    <Button variant="ghost" type="button" onClick={onClick} aria-label={active === "idle" ? `${t("listenTo")} ${label}` : word} aria-busy={active === "loading"}
      title={active === "idle" ? `${t("listenTo")} ${label}` : word}
      className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-full p-0 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
        inverted ? "bg-white/15 text-secondary-foreground hover:bg-white/25" : "bg-muted text-primary hover:bg-primary/15",
        active !== "idle" && (inverted ? "bg-secondary-foreground text-secondary" : "bg-primary text-primary-foreground"))}>
      <Icon aria-hidden className={cn("size-5", active === "loading" && "animate-spin motion-reduce:animate-none")} />
      <span className="sr-only" aria-live="polite">{word}</span>
    </Button>
  );
}
