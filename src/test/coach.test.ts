import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/config", () => ({ COACH_WEBHOOK_URL: "https://example.test/webhook/coach", DEMO_TODAY: "2026-11-07" }));
import { coachPayload, helpTextParts, recognitionLocales, requestCoach } from "@/lib/coach";
import { buildOutlook } from "@/lib/outlook-data";
afterEach(() => vi.unstubAllGlobals());
describe("Coach contract", () => {
  it("sends the whole conversation and the forecast unchanged", () => {
    const forecast = buildOutlook(null), before = JSON.stringify(forecast);
    const messages = [{ role: "user" as const, content: "Can I cover rent?" }, { role: "assistant" as const, content: "Let’s look.", audio: "abc" }, { role: "user" as const, content: "What about insurance?" }];
    expect(coachPayload(messages, "ar", forecast)).toEqual({ messages: [{ role: "user", content: "Can I cover rent?" }, { role: "assistant", content: "Let’s look." }, { role: "user", content: "What about insurance?" }], language: "ar", forecast });
    expect(JSON.stringify(forecast)).toBe(before);
  });
  it("uses the exact five speech-recognition locales", () => {
    expect(recognitionLocales).toEqual({ en: "en-GB", ar: "ar-SA", hi: "hi-IN", bn: "bn-BD", ur: "ur-PK" });
  });
  it("makes StepChange and Citizens Advice mentions safe help links", () => {
    expect(helpTextParts("Try StepChange or Citizens Advice.").filter(part => part.url).map(part => part.url)).toEqual(["https://www.stepchange.org/", "https://www.citizensadvice.org.uk/"]);
  });
  it("reads returned reply text and audio", async () => {
    const mock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ text: "Your reply", audio: "bXAz" })));
    vi.stubGlobal("fetch", mock);
    expect(await requestCoach([{ role: "user", content: "Help" }], "en", buildOutlook(null), new AbortController().signal)).toEqual({ role: "assistant", content: "Your reply", audio: "bXAz" });
    expect(mock.mock.calls[0]?.[0]).toBe("https://example.test/webhook/coach");
  });
});