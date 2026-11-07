import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

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
  component: () => <PlaceholderPage title="outlookTitle" body="outlookSoon" />,
});
