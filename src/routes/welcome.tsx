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
    <div lang="en" dir="ltr" className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-8 px-6 py-10">
      <div className="text-center">
        <div aria-hidden className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-primary text-4xl text-primary-foreground">
          ✦
        </div>
        <h1 className="text-5xl font-bold text-secondary">{t("appName", "en")}</h1>
        <p className="mt-6 text-xl text-foreground">{t("tagline", "en")}</p>
      </div>

      <div>
        {failed && <p role="alert" className="mb-4 text-lg text-destructive">{t("saveError", "en")}</p>}
        <h2 className="mb-5 text-center text-xl font-bold">
          {t("chooseLanguage", "en")}
        </h2>
        <div className="flex flex-col gap-4">
          {languageOptions.map((option) => (
            <Button
              key={option.value}
              lang={option.value}
              dir={option.value === "ar" || option.value === "ur" ? "rtl" : "ltr"}
              onClick={() => choose(option.value)}
              variant={option.value === "en" ? "default" : "outline"}
              className="h-auto min-h-20 rounded-2xl px-6 py-4 text-2xl font-bold focus-visible:ring-4"
            >
              {t(option.labelKey)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
