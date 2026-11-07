import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { ProfileSetup } from "@/components/ProfileSetup";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Set up — Future You" },
      { name: "description", content: "Tell Future You about your income and bills to start your forecast." },
      { property: "og:title", content: "Set up — Future You" },
      { property: "og:description", content: "Tell Future You about your income and bills." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Setup,
});

function Setup() {
  return (
    <>
      <AppHeader />
      <ProfileSetup />
    </>
  );
}
