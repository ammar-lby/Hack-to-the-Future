import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

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
  component: () => <PlaceholderPage title="coachTitle" body="coachSoon" />,
});
