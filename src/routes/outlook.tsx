import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { MoneyModeToggle } from "@/components/Money";
import { Outlook } from "@/components/Outlook";

export const Route = createFileRoute("/outlook")({
  head: () => ({
    meta: [
      { title: "90-day outlook — Future You" },
      { name: "description", content: "See your money forecast for the next 90 days." },
      { property: "og:title", content: "90-day outlook — Future You" },
      { property: "og:description", content: "See your money forecast for the next 90 days." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <><AppHeader /><div className="lg:ps-60"><div className="mx-auto max-w-3xl space-y-6 px-4 pb-28 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10"><MoneyModeToggle /><Outlook /></div></div><BottomNav /></>,
});
