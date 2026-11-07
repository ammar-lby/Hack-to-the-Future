import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLanguage, type Lang } from "@/lib/i18n";
import { languageOptions } from "@/i18n/translations";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — Future You" },
      { name: "description", content: "Choose your language to start using Future You, your money coach for irregular income." },
      { property: "og:title", content: "Welcome — Future You" },
      { property: "og:description", content: "Choose your language to start using Future You." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);


  const choose = (l: Lang) => {
    try { setLang(l); navigate({ to: "/currency" }); } catch { setFailed(true); }
  };

  return (
    <div lang="en" dir="ltr" className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="brand-hero relative hidden overflow-hidden p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-lg"><svg viewBox="0 0 32 32" aria-hidden className="size-8"><path d="M7 21 L13 15 L17 18 L25 9" fill="none" stroke="oklch(0.4 0.14 310)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="25" cy="9" r="2.6" fill="oklch(0.6 0.2 345)" /></svg></span>
          <span><span className="block text-2xl font-bold leading-tight">{t("appName", "en")}</span><span className="block text-xs font-bold uppercase tracking-wider text-white/75">NatWest challenge</span></span>
        </div>
        <div className="max-w-lg">
          <h2 className="text-5xl font-bold leading-tight">Hear from your future self, before money trouble hits.</h2>
          <ul className="mt-10 space-y-5 text-lg">
            <li className="flex gap-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 font-bold">1</span><span><b>See 90 days ahead.</b> A forecast built for pay that changes every week.</span></li>
            <li className="flex gap-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 font-bold">2</span><span><b>Get warned early.</b> A voice note from Future You, with a fix you can afford.</span></li>
            <li className="flex gap-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 font-bold">3</span><span><b>In your language.</b> Read it or hear it, in English or Arabic.</span></li>
          </ul>
        </div>
        <p className="text-sm text-white/70">AI money coach prototype · Not regulated financial advice · Demo data only</p>
        <svg aria-hidden viewBox="0 0 400 200" className="pointer-events-none absolute -bottom-6 -right-10 w-[520px] opacity-15"><path d="M0 170 L90 120 L150 145 L240 70 L300 95 L400 20" fill="none" stroke="white" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </aside>
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-8 px-6 py-10">
        <div className="text-center lg:text-start">
          <div aria-hidden className="brand-hero mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl shadow-lg lg:hidden">
            <svg viewBox="0 0 32 32" className="size-12"><path d="M7 21 L13 15 L17 18 L25 9" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="25" cy="9" r="2.6" fill="white" /></svg>
          </div>
          <h1 className="text-5xl font-bold text-secondary lg:text-4xl">{t("appName", "en")}</h1>
          <p className="mt-4 text-xl text-foreground">{t("tagline", "en")}</p>
        </div>
        <div>
          {failed && <p role="alert" className="mb-4 text-lg text-destructive">{t("saveError", "en")}</p>}
          <h2 className="mb-4 text-center text-xl font-bold lg:text-start">{t("chooseLanguage", "en")}</h2>
          <div className="flex flex-col gap-3">
            {languageOptions.map((option) => (
              <Button
                key={option.value}
                lang={option.value}
                dir={option.value === "ar" || option.value === "ur" ? "rtl" : "ltr"}
                onClick={() => choose(option.value)}
                variant={option.value === "en" ? "default" : "outline"}
                className="h-auto min-h-16 rounded-2xl px-6 py-3 text-2xl font-bold focus-visible:ring-4"
              >
                {t(option.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
