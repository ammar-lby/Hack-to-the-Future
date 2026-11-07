import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { languageOptions, translate, type Lang, type StringKey } from "@/i18n/translations";
import { useRouterState } from "@tanstack/react-router";

export type { Lang, StringKey } from "@/i18n/translations";
export const LANG_STORAGE_KEY = "futureyou.language";

export function loadLanguage(): Lang | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(LANG_STORAGE_KEY);
  return languageOptions.find((option) => option.value === v)?.value ?? null;
}

export function saveLanguage(lang: Lang) {
  window.localStorage.setItem(LANG_STORAGE_KEY, lang);
}

export const dirFor = (lang: Lang) => (lang === "ar" || lang === "ur" ? "rtl" : "ltr");

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: StringKey, language?: Lang) => string };
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const saved = loadLanguage();
    if (saved) setLangState(saved);
  }, []);

  useEffect(() => {
    const documentLanguage = pathname === "/welcome" ? "en" : lang;
    document.documentElement.lang = documentLanguage;
    document.documentElement.dir = dirFor(documentLanguage);
  }, [lang, pathname]);

  const setLang = useCallback((l: Lang) => {
    saveLanguage(l);
    setLangState(l);
  }, []);

  const t = useCallback((k: StringKey, language: Lang = lang) => translate(language, k), [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
