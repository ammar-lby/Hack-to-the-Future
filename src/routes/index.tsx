import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/welcome" });
  },
  head: () => ({
    meta: [
      { title: "Future You — AI money coach" },
      { name: "description", content: "An AI money coach for people with irregular income, in English and Arabic." },
      { property: "og:title", content: "Future You — AI money coach" },
      { property: "og:description", content: "An AI money coach for people with irregular income, in English and Arabic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
