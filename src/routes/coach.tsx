import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { CoachChat } from "@/components/CoachChat";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Ask your coach — Future You" },
      { name: "description", content: "Ask your Future You money coach about your income and bills." },
      { property: "og:title", content: "Ask your coach — Future You" },
      { property: "og:description", content: "Ask your money coach about your income and bills." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <><AppHeader /><div className="lg:ps-60"><div className="mx-auto max-w-xl px-4 pb-28 pt-6 lg:max-w-3xl lg:px-8 lg:pb-12 lg:pt-10"><CoachChat /></div></div><BottomNav /></>,
});
