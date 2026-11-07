import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { useLanguage } from "@/lib/i18n";
import type { StringKey } from "@/i18n/translations";

export function PlaceholderPage({ title, body }: { title: StringKey; body: StringKey }) {
  const { t } = useLanguage();
  return <>
    <AppHeader />
    <main className="mx-auto max-w-xl px-4 pb-28 pt-8">
      <h1 className="text-3xl font-bold text-secondary">{t(title)}</h1>
      <p className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6 text-lg text-muted-foreground">{t(body)}</p>
    </main>
    <BottomNav />
  </>;
}
